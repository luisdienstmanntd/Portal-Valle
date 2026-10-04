-- A shared lock serializes supported occurrence writes and whole-week copies.
create or replace function private.save_occurrence(p_request uuid,p_command jsonb,expected_category public.experience_category,expected_slug text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare existing_id uuid; entity uuid; e public.experiences; o public.experience_occurrences;
 v integer; slots integer; people integer; occupied_units integer; occupied_people integer;
 begin_at timestamptz; finish_at timestamptz; action text;
begin
 existing_id:=private.begin_mutation(p_request,p_command,'experiences.manage',expected_category::text||'.'||expected_slug||'.occurrence');
 if existing_id is not null then return existing_id; end if;
 perform pg_advisory_xact_lock(hashtextextended('portal-occurrence-writer',0));
 if p_command-array['action','id','version','experience_id','starts_at','ends_at','location','film_title','capacity','person_limit','status','title'] <> '{}'::jsonb then raise exception 'E_INPUT'; end if;
 entity:=(p_command->>'id')::uuid; v:=(p_command->>'version')::integer; action:=p_command->>'action';
 if entity is null or v is null or coalesce(action,'') not in ('save','cancel') then raise exception 'E_INPUT'; end if;
 select * into e from public.experiences where id=(p_command->>'experience_id')::uuid for share;
 if not found or not e.active or e.category<>expected_category or e.slug<>expected_slug or e.capacity_mode not in ('units','persons') or (e.capacity_mode='units' and e.persons_per_unit is null) then raise exception 'E_CONFIGURATION'; end if;
 select * into o from public.experience_occurrences where id=entity for update;
 if found then
  if o.experience_id<>e.id or o.version<>v then raise exception 'E_VERSION'; end if;
 else
  if v<>0 or action<>'save' then raise exception 'E_VERSION'; end if;
 end if;
 if action='cancel' then
  if o.status='cancelled' then raise exception 'E_CANCELLED'; end if;
  update public.experience_occurrences set status='cancelled',version=version+1 where id=entity;
  update public.experience_bookings set status='cancelled',version=version+1 where occurrence_id=entity and status<>'cancelled';
 else
  if o.status='cancelled' then raise exception 'E_CANCELLED'; end if;
  slots:=(p_command->>'capacity')::integer; people:=(p_command->>'person_limit')::integer;
  begin_at:=(p_command->>'starts_at')::timestamptz; finish_at:=(p_command->>'ends_at')::timestamptz;
  if slots is null or people is null or slots<0 or slots>e.default_capacity or people<0 or people>e.person_limit
   or begin_at is null or finish_at is null or finish_at<=begin_at
   or coalesce(p_command->>'status','') not in ('draft','published')
   or coalesce(length(btrim(p_command->>'location')),0) not between 1 and 160
   or (e.category='cinema' and coalesce(length(btrim(p_command->>'film_title')),0) not between 1 and 160)
   or (e.category<>'cinema' and p_command ? 'film_title')
   or (e.category='gastronomy' and coalesce(length(btrim(p_command->>'title')),0) not between 1 and 160)
   or (p_command ? 'title' and coalesce(length(btrim(p_command->>'title')),0) not between 1 and 160) then raise exception 'E_INPUT'; end if;
  if exists(select 1 from public.experience_bookings where occurrence_id=entity and status='no_show') then raise exception 'E_POLICY'; end if;
  select coalesce(sum(units),0),coalesce(sum(adults),0) into occupied_units,occupied_people
   from public.experience_bookings where occurrence_id=entity and status in ('reserved','confirmed');
  if (case when e.capacity_mode='persons' then occupied_people else occupied_units end)>slots or occupied_people>people then raise exception 'E_CAPACITY'; end if;
  if v=0 then
   insert into public.experience_occurrences(id,experience_id,starts_at,ends_at,location,capacity_override,person_limit_override,status,metadata,responsible_id,title_override)
   values(entity,e.id,begin_at,finish_at,btrim(p_command->>'location'),slots,people,(p_command->>'status')::public.occurrence_status,case when e.category='cinema' then jsonb_build_object('film_title',btrim(p_command->>'film_title')) else '{}'::jsonb end,auth.uid(),btrim(p_command->>'title'));
  else
   update public.experience_occurrences set starts_at=begin_at,ends_at=finish_at,location=btrim(p_command->>'location'),
    capacity_override=slots,person_limit_override=people,status=(p_command->>'status')::public.occurrence_status,
    metadata=case when e.category='cinema' then jsonb_build_object('film_title',btrim(p_command->>'film_title')) else '{}'::jsonb end,title_override=btrim(p_command->>'title'),version=version+1 where id=entity;
  end if;
 end if;
 insert into private.mutation_requests(actor_id,request_id,payload_hash,entity_id,operation)
  values(auth.uid(),p_request,encode(extensions.digest(p_command::text,'sha256'),'hex'),entity,expected_category::text||'.'||expected_slug||'.occurrence');
 return entity;
exception when invalid_text_representation or numeric_value_out_of_range or datetime_field_overflow then raise exception 'E_INPUT';
end; $$;


create table private.week_duplication_results (
 actor_id uuid not null,request_id uuid not null,occurrence_ids uuid[] not null,
 primary key(actor_id,request_id),
 foreign key(actor_id,request_id) references private.mutation_requests(actor_id,request_id) on delete cascade
);
alter table private.week_duplication_results enable row level security;
revoke all on private.week_duplication_results from public,anon,authenticated,service_role;
create function public.portal_duplicate_week(p_request uuid,p_command jsonb) returns uuid[]
language plpgsql security definer set search_path='' as $$
declare previous_id uuid; source_day date; target_day date; offset_days integer;
 source_start timestamptz; source_end timestamptz; target_start timestamptz; target_end timestamptz;
 original public.experience_occurrences; new_id uuid; copied uuid[]:='{}'; shifted_start timestamp; shifted_end timestamp; next_start timestamptz; next_end timestamptz;
begin
 previous_id:=private.begin_mutation(p_request,p_command,'weekly_program.manage','weekly.duplicate');
 if previous_id is not null then
  select occurrence_ids into copied from private.week_duplication_results where actor_id=auth.uid() and request_id=p_request;
  if copied is null then raise exception 'E_IDEMPOTENCY'; end if;
  return copied;
 end if;
 if p_command-array['source_week','target_week']<>'{}'::jsonb
  or coalesce(p_command->>'source_week','') !~ '^\d{4}-\d{2}-\d{2}$'
  or coalesce(p_command->>'target_week','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'E_INPUT'; end if;
 source_day:=(p_command->>'source_week')::date; target_day:=(p_command->>'target_week')::date;
 if extract(isodow from source_day)<>1 or extract(isodow from target_day)<>1 or source_day=target_day then raise exception 'E_INPUT'; end if;
 source_start:=source_day::timestamp at time zone 'America/Sao_Paulo';
 source_end:=(source_day+7)::timestamp at time zone 'America/Sao_Paulo';
 target_start:=target_day::timestamp at time zone 'America/Sao_Paulo';
 target_end:=(target_day+7)::timestamp at time zone 'America/Sao_Paulo'; offset_days:=target_day-source_day;
 perform pg_advisory_xact_lock(hashtextextended('portal-occurrence-writer',0));
 -- Catalogue locks precede occurrence locks, as in every supported writer.
 perform 1 from public.experiences where active and slug in ('cine-toscana','la-vera-pizza') order by id for share;
 if exists(select 1 from public.experience_occurrences where starts_at>=target_start and starts_at<target_end) then raise exception 'E_WEEK_OCCUPIED'; end if;
 for original in
  select o.* from public.experience_occurrences o join public.experiences e on e.id=o.experience_id
  where e.active and ((e.slug='cine-toscana' and e.category='cinema') or (e.slug='la-vera-pizza' and e.category='gastronomy'))
   and o.starts_at>=source_start and o.starts_at<source_end and o.status in ('draft','published')
  order by o.id for share of o
 loop
  if cardinality(copied)>=100 then raise exception 'E_WEEK_LIMIT'; end if;
  new_id:=gen_random_uuid();
  shifted_start:=(original.starts_at at time zone 'America/Sao_Paulo')+make_interval(days=>offset_days);
  shifted_end:=(original.ends_at at time zone 'America/Sao_Paulo')+make_interval(days=>offset_days);
  next_start:=shifted_start at time zone 'America/Sao_Paulo'; next_end:=shifted_end at time zone 'America/Sao_Paulo';
  if next_start at time zone 'America/Sao_Paulo'<>shifted_start or next_end at time zone 'America/Sao_Paulo'<>shifted_end or next_end<=next_start then raise exception 'E_INPUT'; end if;
  insert into public.experience_occurrences(id,experience_id,starts_at,ends_at,location,capacity_override,person_limit_override,
   status,title_override,description_override,metadata,responsible_id)
  values(new_id,original.experience_id,
   next_start,next_end,
   original.location,original.capacity_override,original.person_limit_override,'draft',original.title_override,original.description_override,original.metadata,auth.uid());
  copied:=array_append(copied,new_id);
 end loop;
 if cardinality(copied)=0 then raise exception 'E_EMPTY_WEEK'; end if;
 insert into private.mutation_requests(actor_id,request_id,payload_hash,entity_id,operation)
 values(auth.uid(),p_request,encode(extensions.digest(p_command::text,'sha256'),'hex'),p_request,'weekly.duplicate');
 insert into private.week_duplication_results(actor_id,request_id,occurrence_ids) values(auth.uid(),p_request,copied);
 return copied;
exception when invalid_text_representation or datetime_field_overflow or check_violation then raise exception 'E_INPUT';
end; $$;
revoke all on function public.portal_duplicate_week(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.portal_duplicate_week(uuid,jsonb) to authenticated;
