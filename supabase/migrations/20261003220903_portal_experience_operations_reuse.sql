-- Owner rule: adult places; children only in notes. Lora remains deferred.
alter table public.experiences drop column children_allowed;
alter table private.mutation_requests add column operation text not null default 'legacy';
update private.mutation_requests r set operation='cinema.cine-toscana.occurrence' where exists(select 1 from public.experience_occurrences o where o.id=r.entity_id);
update private.mutation_requests r set operation='cinema.cine-toscana.booking' where exists(select 1 from public.experience_bookings b where b.id=r.entity_id);
alter table private.mutation_requests alter column operation drop default;
create function private.begin_mutation(req uuid, command jsonb, permission text, operation_key text) returns uuid
language plpgsql set search_path='' as $$
declare previous private.mutation_requests; fingerprint text;
begin
 if auth.uid() is null or not private.has_permission(permission) then raise exception 'E_FORBIDDEN'; end if;
 if req is null or command is null or jsonb_typeof(command)<>'object' or length(command::text)>10000 then raise exception 'E_INPUT'; end if;
 perform pg_advisory_xact_lock(hashtextextended('portal-request:'||auth.uid()::text||':'||req::text,0));
 fingerprint:=encode(extensions.digest(command::text,'sha256'),'hex');
 select * into previous from private.mutation_requests where actor_id=auth.uid() and request_id=req;
 if found then
  if previous.operation<>operation_key or previous.payload_hash<>fingerprint then raise exception 'E_IDEMPOTENCY'; end if;
  return previous.entity_id;
 end if;
 return null;
end; $$;
revoke all on function private.begin_mutation(uuid,jsonb,text,text) from public,anon,authenticated,service_role;


create function private.save_occurrence(p_request uuid,p_command jsonb,expected_category public.experience_category,expected_slug text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare existing_id uuid; entity uuid; e public.experiences; o public.experience_occurrences;
 v integer; slots integer; people integer; occupied_units integer; occupied_people integer;
 begin_at timestamptz; finish_at timestamptz; action text;
begin
 existing_id:=private.begin_mutation(p_request,p_command,'experiences.manage',expected_category::text||'.'||expected_slug||'.occurrence');
 if existing_id is not null then return existing_id; end if;
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

create function private.save_booking(p_request uuid,p_command jsonb,expected_category public.experience_category,expected_slug text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare existing_id uuid; entity uuid; occurrence uuid; b public.experience_bookings;
 o public.experience_occurrences; e public.experiences; v integer; requested_adults integer; slots integer;
 used_units integer; used_people integer; action text;
begin
 existing_id:=private.begin_mutation(p_request,p_command,'bookings.manage',expected_category::text||'.'||expected_slug||'.booking');
 if existing_id is not null then return existing_id; end if;
 if p_command-array['action','id','version','occurrence_id','adults','children','apartment_number','guest_name','notes','status','attendance_status'] <> '{}'::jsonb then raise exception 'E_INPUT'; end if;
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
  if requested_adults is null or requested_adults<1 or requested_adults>e.person_limit or coalesce((p_command->>'children')::integer,-1)<>0 then raise exception 'E_INPUT'; end if;
  if coalesce(length(btrim(p_command->>'apartment_number')),0) not between 1 and 30
   or coalesce(length(btrim(p_command->>'guest_name')),0) not between 1 and 160
   or coalesce(length(p_command->>'notes'),0)>2000
   or coalesce(p_command->>'status','') not in ('reserved','confirmed')
   or coalesce(p_command->>'attendance_status','') not in ('pending','present','absent') then raise exception 'E_INPUT'; end if;
  if exists(select 1 from public.experience_bookings where occurrence_id=occurrence and status='no_show') then raise exception 'E_POLICY'; end if;
  slots:=case when e.capacity_mode='units' then ceil(requested_adults::numeric/e.persons_per_unit)::integer else 0 end;
  select coalesce(sum(units),0),coalesce(sum(adults),0) into used_units,used_people
   from public.experience_bookings where occurrence_id=occurrence and id<>entity and status in ('reserved','confirmed');
  if (case when e.capacity_mode='persons' then used_people+requested_adults else used_units+slots end)>coalesce(o.capacity_override,e.default_capacity)
   or used_people+requested_adults>coalesce(o.person_limit_override,e.person_limit) then raise exception 'E_CAPACITY'; end if;
  if v=0 then
   insert into public.experience_bookings(id,occurrence_id,apartment_number,guest_name,adults,children,units,notes,status,attendance_status,created_by)
   values(entity,occurrence,btrim(p_command->>'apartment_number'),btrim(p_command->>'guest_name'),requested_adults,0,slots,
    nullif(p_command->>'notes',''),(p_command->>'status')::public.booking_status,(p_command->>'attendance_status')::public.attendance_status,auth.uid());
  else
   update public.experience_bookings set apartment_number=btrim(p_command->>'apartment_number'),guest_name=btrim(p_command->>'guest_name'),
    adults=requested_adults,children=0,units=slots,notes=nullif(p_command->>'notes',''),status=(p_command->>'status')::public.booking_status,
    attendance_status=(p_command->>'attendance_status')::public.attendance_status,version=version+1 where id=entity;
  end if;
 end if;
 insert into private.mutation_requests(actor_id,request_id,payload_hash,entity_id,operation)
  values(auth.uid(),p_request,encode(extensions.digest(p_command::text,'sha256'),'hex'),entity,expected_category::text||'.'||expected_slug||'.booking');
 return entity;
exception when invalid_text_representation or numeric_value_out_of_range then raise exception 'E_INPUT';
end; $$;

revoke all on function private.save_occurrence(uuid,jsonb,public.experience_category,text),private.save_booking(uuid,jsonb,public.experience_category,text) from public,anon,authenticated,service_role;
create or replace function public.portal_save_occurrence(p_request uuid,p_command jsonb) returns uuid
language sql security definer set search_path='' as $$ select private.save_occurrence(p_request,p_command,'cinema'::public.experience_category,'cine-toscana'); $$;
revoke all on function public.portal_save_occurrence(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.portal_save_occurrence(uuid,jsonb) to authenticated;
create or replace function public.portal_save_booking(p_request uuid,p_command jsonb) returns uuid
language sql security definer set search_path='' as $$ select private.save_booking(p_request,p_command,'cinema'::public.experience_category,'cine-toscana'); $$;
revoke all on function public.portal_save_booking(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.portal_save_booking(uuid,jsonb) to authenticated;
create or replace function public.portal_pizza_save_occurrence(p_request uuid,p_command jsonb) returns uuid
language sql security definer set search_path='' as $$ select private.save_occurrence(p_request,p_command,'gastronomy'::public.experience_category,'la-vera-pizza'); $$;
revoke all on function public.portal_pizza_save_occurrence(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.portal_pizza_save_occurrence(uuid,jsonb) to authenticated;
create or replace function public.portal_pizza_save_booking(p_request uuid,p_command jsonb) returns uuid
language sql security definer set search_path='' as $$ select private.save_booking(p_request,p_command,'gastronomy'::public.experience_category,'la-vera-pizza'); $$;
revoke all on function public.portal_pizza_save_booking(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.portal_pizza_save_booking(uuid,jsonb) to authenticated;

drop function private.begin_mutation(uuid,jsonb,text);
create or replace function private.validate_booking_configuration() returns trigger language plpgsql set search_path='' as $$
declare e public.experiences;
begin
 select ex.* into e from public.experiences ex join public.experience_occurrences o on o.experience_id=ex.id where o.id=NEW.occurrence_id;
 if e.category in ('cinema','gastronomy','wine') and NEW.children<>0 then raise check_violation using message='E_CHILDREN'; end if;
 if e.persons_per_unit is not null and e.capacity_mode='units' and NEW.units<>ceil((NEW.adults)::numeric/e.persons_per_unit)::integer then
  raise check_violation using message='E_UNITS';
 end if;
 if e.capacity_mode='persons' and NEW.units<>0 then raise check_violation using message='E_UNITS'; end if;
 return NEW;
end; $$;

create or replace function private.audit_experience_change() returns trigger
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); old_data jsonb; new_data jsonb; entity uuid;
 safe_fields text[]:=array['id','experience_id','occurrence_id','category','booking_mode','capacity_mode','default_capacity','person_limit','active','guest_bookable',
 'starts_at','ends_at','capacity_override','person_limit_override','status','attendance_status','adults','children','units','version','responsible_id','persons_per_unit'];
begin
 if actor is not null and not private.has_permission(case when TG_TABLE_NAME='experience_bookings' then 'bookings.manage' else 'experiences.manage' end) then raise insufficient_privilege using message='E_FORBIDDEN'; end if;
 if TG_OP<>'INSERT' then select coalesce(jsonb_object_agg(key,value),'{}') into old_data from jsonb_each(to_jsonb(OLD)) where key=any(safe_fields); end if;
 if TG_OP<>'DELETE' then select coalesce(jsonb_object_agg(key,value),'{}') into new_data from jsonb_each(to_jsonb(NEW)) where key=any(safe_fields); end if;
 if TG_OP='DELETE' then entity:=OLD.id; else entity:=NEW.id; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,before,after) values(actor,TG_OP,TG_TABLE_NAME,entity,old_data,new_data);
 return null;
end; $$;

-- Catalogue configuration only; no sessions or guests.
insert into public.experiences(id,slug,name,category,booking_mode,capacity_mode,default_capacity,person_limit,active)
values('c8000000-0000-4000-8000-000000000001','la-vera-pizza','La Vera Pizza','gastronomy','group','persons',12,12,true);
