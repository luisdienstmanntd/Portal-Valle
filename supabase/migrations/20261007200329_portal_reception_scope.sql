-- Reception workspace, shared program and Pizza owner rules (2026-10-07).
create or replace function private.has_permission(permission text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.portal_profiles p join auth.sessions s on s.user_id=p.id
 where p.id=(select auth.uid()) and p.active and s.id=nullif((select auth.jwt())->>'session_id','')::uuid
 and (s.not_after is null or s.not_after>now()) and (
 permission in ('portal.read','experiences.read','experiences.manage','weekly_program.manage','bookings.manage','facilities.read','osteria.read')
 or (permission='reports.read' and p.role in ('gerencia','admin'))
 or (permission='settings.manage' and p.role='admin')));
$$;
alter table public.experience_bookings add column exception_reason text check (exception_reason is null or length(btrim(exception_reason)) between 10 and 1000);
update public.experiences set default_capacity=20,person_limit=20 where slug='la-vera-pizza';
-- Existing sessions keep their explicitly configured capacities; new sessions default to 20.
insert into public.experiences(id,slug,name,category,booking_mode,capacity_mode,default_capacity,person_limit,active)
values('c7000000-0000-4000-8000-000000000001','programacao-hotel','Atividades do hotel','other','group','persons',10000,10000,true);
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
   or (e.slug='programacao-hotel' and coalesce(length(btrim(p_command->>'title')),0) not between 1 and 160) or (p_command ? 'title' and coalesce(length(btrim(p_command->>'title')),0) not between 1 and 160) then raise exception 'E_INPUT'; end if;
  if exists(select 1 from public.experience_bookings where occurrence_id=entity and status='no_show') then raise exception 'E_POLICY'; end if;
  select coalesce(sum(units),0),coalesce(sum(adults+case when e.slug='la-vera-pizza' then children else 0 end),0) into occupied_units,occupied_people
   from public.experience_bookings where occurrence_id=entity and status in ('reserved','confirmed');
  if ((case when e.capacity_mode='persons' then occupied_people else occupied_units end)>slots or occupied_people>people)
    and not (e.slug='la-vera-pizza' and o.id is not null
      and slots>=coalesce(o.capacity_override,e.default_capacity)
      and people>=coalesce(o.person_limit_override,e.person_limit)) then raise exception 'E_CAPACITY'; end if;
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


create or replace function private.save_booking(p_request uuid,p_command jsonb,expected_category public.experience_category,expected_slug text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare existing_id uuid; entity uuid; occurrence uuid; b public.experience_bookings;
 o public.experience_occurrences; e public.experiences; v integer; requested_adults integer; slots integer;
 used_units integer; used_people integer; action text; requested_children integer; requested_people integer; reason text; exceeds boolean;
begin
 existing_id:=private.begin_mutation(p_request,p_command,'bookings.manage',expected_category::text||'.'||expected_slug||'.booking');
 if existing_id is not null then return existing_id; end if;
 if p_command-array['action','id','version','occurrence_id','adults','children','apartment_number','guest_name','notes','status','attendance_status','exception_reason'] <> '{}'::jsonb then raise exception 'E_INPUT'; end if;
 entity:=(p_command->>'id')::uuid; occurrence:=(p_command->>'occurrence_id')::uuid;
 v:=(p_command->>'version')::integer; action:=p_command->>'action';
 if entity is null or occurrence is null or v is null or coalesce(action,'') not in ('save','cancel') then raise exception 'E_INPUT'; end if;
 -- Every writer locks the same occurrence before any booking row. Transfers are not allowed here.
 select ex.* into e from public.experiences ex join public.experience_occurrences oc on oc.experience_id=ex.id where oc.id=occurrence for share of ex;
 if not found or not e.active or e.category<>expected_category or e.slug<>expected_slug or e.capacity_mode not in ('units','persons') or (e.capacity_mode='units' and e.persons_per_unit is null) then raise exception 'E_CONFIGURATION'; end if;
 select * into o from public.experience_occurrences where id=occurrence for update;
 select * into b from public.experience_bookings where id=entity for update;
 if found then
  if b.occurrence_id<>occurrence or b.version<>v then raise exception 'E_VERSION'; end if;
 else
  if v<>0 or action<>'save' then raise exception 'E_VERSION'; end if;
 end if;
 if action='cancel' then
  if b.status='cancelled' then raise exception 'E_CANCELLED'; end if;
  update public.experience_bookings set status='cancelled',version=version+1 where id=entity;
 else
  if o.status<>'published' then raise exception 'E_CANCELLED'; end if;
  requested_adults:=(p_command->>'adults')::integer;
  requested_children:=(p_command->>'children')::integer;
  reason:=nullif(btrim(p_command->>'exception_reason'),'');
  if (reason is not null and (e.slug<>'la-vera-pizza' or length(reason) not between 10 and 1000)) then raise exception 'E_INPUT'; end if;
  requested_people:=requested_adults+case when e.slug='la-vera-pizza' then requested_children else 0 end;
  if requested_adults is null or requested_adults<1 or requested_adults>10000 or requested_children is null or requested_children<0 or requested_children>10000
    or (e.slug<>'la-vera-pizza' and (requested_adults>e.person_limit or requested_children<>0)) then raise exception 'E_INPUT'; end if;
  if coalesce(length(btrim(p_command->>'apartment_number')),0) not between 1 and 30
   or coalesce(length(btrim(p_command->>'guest_name')),0) not between 1 and 160
   or coalesce(length(p_command->>'notes'),0)>2000
   or coalesce(p_command->>'status','') not in ('reserved','confirmed')
   or coalesce(p_command->>'attendance_status','') not in ('pending','present','absent') then raise exception 'E_INPUT'; end if;
  if exists(select 1 from public.experience_bookings where occurrence_id=occurrence and status='no_show') then raise exception 'E_POLICY'; end if;
  slots:=case when e.capacity_mode='units' then ceil(requested_adults::numeric/e.persons_per_unit)::integer else 0 end;
  select coalesce(sum(units),0),coalesce(sum(adults+case when e.slug='la-vera-pizza' then children else 0 end),0) into used_units,used_people
   from public.experience_bookings where occurrence_id=occurrence and id<>entity and status in ('reserved','confirmed');
  exceeds:=(case when e.capacity_mode='persons' then used_people+requested_people else used_units+slots end)>coalesce(o.capacity_override,e.default_capacity)
   or used_people+requested_people>coalesce(o.person_limit_override,e.person_limit);
  if exceeds and (e.slug<>'la-vera-pizza' or reason is null) then raise exception 'E_CAPACITY'; end if;
  if not exceeds then reason:=null; end if;
  if v=0 then
   insert into public.experience_bookings(id,occurrence_id,apartment_number,guest_name,adults,children,units,notes,status,attendance_status,created_by,exception_reason)
   values(entity,occurrence,btrim(p_command->>'apartment_number'),btrim(p_command->>'guest_name'),requested_adults,requested_children,slots,
    nullif(p_command->>'notes',''),(p_command->>'status')::public.booking_status,(p_command->>'attendance_status')::public.attendance_status,auth.uid(),reason);
  else
   update public.experience_bookings set apartment_number=btrim(p_command->>'apartment_number'),guest_name=btrim(p_command->>'guest_name'),
    adults=requested_adults,children=requested_children,exception_reason=reason,units=slots,notes=nullif(p_command->>'notes',''),status=(p_command->>'status')::public.booking_status,
    attendance_status=(p_command->>'attendance_status')::public.attendance_status,version=version+1 where id=entity;
  end if;
 end if;
 insert into private.mutation_requests(actor_id,request_id,payload_hash,entity_id,operation)
  values(auth.uid(),p_request,encode(extensions.digest(p_command::text,'sha256'),'hex'),entity,expected_category::text||'.'||expected_slug||'.booking');
 return entity;
exception when invalid_text_representation or numeric_value_out_of_range then raise exception 'E_INPUT';
end; $$;
-- Bound user dates to the supported operational range without editing prior migrations.
create or replace function public.portal_duplicate_week(p_request uuid,p_command jsonb) returns uuid[]
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
 if source_day not between date '1900-01-01' and date '2099-12-31' or target_day not between date '1900-01-01' and date '2099-12-31' then raise exception 'E_INPUT'; end if;
 if extract(isodow from source_day)<>1 or extract(isodow from target_day)<>1 or source_day=target_day then raise exception 'E_INPUT'; end if;
 source_start:=source_day::timestamp at time zone 'America/Sao_Paulo';
 source_end:=(source_day+7)::timestamp at time zone 'America/Sao_Paulo';
 target_start:=target_day::timestamp at time zone 'America/Sao_Paulo';
 target_end:=(target_day+7)::timestamp at time zone 'America/Sao_Paulo'; offset_days:=target_day-source_day;
 perform pg_advisory_xact_lock(hashtextextended('portal-occurrence-writer',0));
 -- Catalogue locks precede occurrence locks, as in every supported writer.
 perform 1 from public.experiences where active and slug in ('cine-toscana','la-vera-pizza','programacao-hotel') order by id for share;
 if exists(select 1 from public.experience_occurrences where starts_at>=target_start and starts_at<target_end) then raise exception 'E_WEEK_OCCUPIED'; end if;
 for original in
  select o.* from public.experience_occurrences o join public.experiences e on e.id=o.experience_id
  where e.active and ((e.slug='cine-toscana' and e.category='cinema') or (e.slug='la-vera-pizza' and e.category='gastronomy') or (e.slug='programacao-hotel' and e.category='other'))
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
create or replace function private.audit_experience_change() returns trigger
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); old_data jsonb; new_data jsonb; entity uuid;
 safe_fields text[]:=array['id','experience_id','occurrence_id','category','booking_mode','capacity_mode','default_capacity','person_limit','active','guest_bookable',
 'starts_at','ends_at','capacity_override','person_limit_override','status','attendance_status','adults','children','units','version','responsible_id','persons_per_unit','exception_reason'];
begin
 if actor is not null and not private.has_permission(case when TG_TABLE_NAME='experience_bookings' then 'bookings.manage' else 'experiences.manage' end) then raise insufficient_privilege using message='E_FORBIDDEN'; end if;
 if TG_OP<>'INSERT' then select coalesce(jsonb_object_agg(key,value),'{}') into old_data from jsonb_each(to_jsonb(OLD)) where key=any(safe_fields); end if;
 if TG_OP<>'DELETE' then select coalesce(jsonb_object_agg(key,value),'{}') into new_data from jsonb_each(to_jsonb(NEW)) where key=any(safe_fields); end if;
 if TG_OP='DELETE' then entity:=OLD.id; else entity:=NEW.id; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,before,after) values(actor,TG_OP,TG_TABLE_NAME,entity,old_data,new_data);
 return null;
end; $$;


create or replace function private.validate_booking_configuration() returns trigger language plpgsql set search_path='' as $$
declare e public.experiences;
begin
 select ex.* into e from public.experiences ex join public.experience_occurrences o on o.experience_id=ex.id where o.id=NEW.occurrence_id;
 if e.slug<>'la-vera-pizza' and NEW.children<>0 then raise check_violation using message='E_CHILDREN'; end if;
 if e.persons_per_unit is not null and e.capacity_mode='units' and NEW.units<>ceil((NEW.adults)::numeric/e.persons_per_unit)::integer then raise check_violation using message='E_UNITS'; end if;
 if e.capacity_mode='persons' and NEW.units<>0 then raise check_violation using message='E_UNITS'; end if;
 return NEW;
end; $$;
create function public.portal_program_save_occurrence(p_request uuid,p_command jsonb) returns uuid
language sql security definer set search_path='' as $$ select private.save_occurrence(p_request,p_command,'other'::public.experience_category,'programacao-hotel'); $$;
create function public.portal_program_save_booking(p_request uuid,p_command jsonb) returns uuid
language sql security definer set search_path='' as $$ select private.save_booking(p_request,p_command,'other'::public.experience_category,'programacao-hotel'); $$;
revoke all on function public.portal_program_save_occurrence(uuid,jsonb),public.portal_program_save_booking(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.portal_program_save_occurrence(uuid,jsonb),public.portal_program_save_booking(uuid,jsonb) to authenticated;
