-- Keep "same apartment and session day inside the stay period" true after linking.
-- Refuse the change; the operator must unlink first (explicit, audited).
create function private.guard_booking_stay_apartment() returns trigger
language plpgsql set search_path='' as $$
declare s public.portal_stays;
begin
 if NEW.stay_id is not null and NEW.apartment_number is distinct from OLD.apartment_number then
  select * into s from public.portal_stays where id=NEW.stay_id;
  if lower(btrim(NEW.apartment_number))<>lower(s.apartment) then raise exception 'E_PERIOD'; end if;
 end if;
 return NEW;
end; $$;
revoke all on function private.guard_booking_stay_apartment() from public,anon,authenticated,service_role;
create trigger bookings_stay_apartment_guard before update on public.experience_bookings
 for each row execute function private.guard_booking_stay_apartment();

create function private.guard_occurrence_stay_period() returns trigger
language plpgsql set search_path='' as $$
declare new_day date;
begin
 if NEW.starts_at is distinct from OLD.starts_at then
  new_day:=(NEW.starts_at at time zone 'America/Sao_Paulo')::date;
  if exists(select 1 from public.experience_bookings b join public.portal_stays s on s.id=b.stay_id
   where b.occurrence_id=NEW.id and b.status in ('reserved','confirmed') and new_day not between s.arrival_date and s.departure_date) then
   raise exception 'E_PERIOD';
  end if;
 end if;
 return NEW;
end; $$;
revoke all on function private.guard_occurrence_stay_period() from public,anon,authenticated,service_role;
create trigger occurrences_stay_period_guard before update on public.experience_occurrences
 for each row execute function private.guard_occurrence_stay_period();

-- Unlinking a cancelled booking must stay possible; only new links require an active booking.
create or replace function public.portal_link_booking_stay(p_request uuid,p_command jsonb) returns uuid
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
 select oc.* into o from public.experience_occurrences oc join public.experience_bookings bk on bk.occurrence_id=oc.id where bk.id=entity for update of oc;
 if not found then raise exception 'E_VERSION'; end if;
 select * into b from public.experience_bookings where id=entity for update;
 if b.version<>v then raise exception 'E_VERSION'; end if;
 if target_stay is not null then
  if b.status not in ('reserved','confirmed') then raise exception 'E_CANCELLED'; end if;
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
