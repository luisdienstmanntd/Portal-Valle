-- Explicit booking -> Portal stay link. Never inferred from apartment/date coincidence.
alter table public.experience_bookings drop constraint experience_bookings_stay_id_check;
alter table public.experience_bookings add constraint bookings_stay_fk
 foreign key (stay_id) references public.portal_stays(id) on delete restrict;
create index bookings_stay on public.experience_bookings(stay_id) where stay_id is not null;

-- stay_id is an opaque UUID, safe for the audit allowlist.
create or replace function private.audit_experience_change() returns trigger
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); old_data jsonb; new_data jsonb; entity uuid;
 safe_fields text[]:=array['id','experience_id','occurrence_id','category','booking_mode','capacity_mode','default_capacity','person_limit','active','guest_bookable',
 'starts_at','ends_at','capacity_override','person_limit_override','status','attendance_status','adults','children','units','version','responsible_id','persons_per_unit','stay_id'];
begin
 if actor is not null and not private.has_permission(case when TG_TABLE_NAME='experience_bookings' then 'bookings.manage' else 'experiences.manage' end) then raise insufficient_privilege using message='E_FORBIDDEN'; end if;
 if TG_OP<>'INSERT' then select coalesce(jsonb_object_agg(key,value),'{}') into old_data from jsonb_each(to_jsonb(OLD)) where key=any(safe_fields); end if;
 if TG_OP<>'DELETE' then select coalesce(jsonb_object_agg(key,value),'{}') into new_data from jsonb_each(to_jsonb(NEW)) where key=any(safe_fields); end if;
 if TG_OP='DELETE' then entity:=OLD.id; else entity:=NEW.id; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,before,after) values(actor,TG_OP,TG_TABLE_NAME,entity,old_data,new_data);
 return null;
end; $$;

create function public.portal_link_booking_stay(p_request uuid,p_command jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare previous_id uuid; entity uuid; v integer; target_stay uuid; b public.experience_bookings;
 o public.experience_occurrences; s public.portal_stays; session_day date;
begin
 previous_id:=private.begin_mutation(p_request,p_command,'bookings.manage','booking.link_stay');
 if previous_id is not null then return previous_id; end if;
 if not private.has_permission('stays.read') then raise exception 'E_FORBIDDEN'; end if;
 if p_command-array['booking_id','version','stay_id']<>'{}'::jsonb or not p_command ?& array['booking_id','version','stay_id']
  or jsonb_typeof(p_command->'booking_id')<>'string' or jsonb_typeof(p_command->'version')<>'number'
  or jsonb_typeof(p_command->'stay_id') not in ('string','null') then raise exception 'E_INPUT'; end if;
 entity:=(p_command->>'booking_id')::uuid; v:=(p_command->>'version')::integer; target_stay:=(p_command->>'stay_id')::uuid;
 -- Same lock order as save_booking: occurrence first, then booking.
 select oc.* into o from public.experience_occurrences oc join public.experience_bookings bk on bk.occurrence_id=oc.id where bk.id=entity for update of oc;
 if not found then raise exception 'E_VERSION'; end if;
 select * into b from public.experience_bookings where id=entity for update;
 if b.version<>v then raise exception 'E_VERSION'; end if;
 if b.status not in ('reserved','confirmed') then raise exception 'E_CANCELLED'; end if;
 if target_stay is not null then
  select * into s from public.portal_stays where id=target_stay for share;
  if not found then raise exception 'E_INPUT'; end if;
  session_day:=(o.starts_at at time zone 'America/Sao_Paulo')::date;
  if lower(btrim(b.apartment_number))<>lower(s.apartment) or session_day not between s.arrival_date and s.departure_date then raise exception 'E_PERIOD'; end if;
 end if;
 if b.stay_id is not distinct from target_stay then raise exception 'E_VERSION'; end if;
 update public.experience_bookings set stay_id=target_stay,version=version+1 where id=entity;
 insert into private.mutation_requests(actor_id,request_id,payload_hash,entity_id,operation)
  values(auth.uid(),p_request,encode(extensions.digest(p_command::text,'sha256'),'hex'),entity,'booking.link_stay');
 return entity;
exception when invalid_text_representation or numeric_value_out_of_range then raise exception 'E_INPUT';
end; $$;
revoke all on function public.portal_link_booking_stay(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.portal_link_booking_stay(uuid,jsonb) to authenticated;
