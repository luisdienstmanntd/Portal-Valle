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
