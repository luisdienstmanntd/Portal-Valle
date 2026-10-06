-- Portal-owned registry. No guest records, PMS or external system writes.
create or replace function private.has_permission(permission text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.portal_profiles p join auth.sessions s on s.user_id=p.id
 where p.id=(select auth.uid()) and p.active and s.id=nullif((select auth.jwt())->>'session_id','')::uuid
 and (s.not_after is null or s.not_after>now()) and (
 permission in ('portal.read','experiences.read','bookings.manage','stays.read','stays.manage','facilities.read','osteria.read')
 or (permission in ('experiences.manage','weekly_program.manage','reports.read') and p.role in ('gerencia','admin'))
 or (permission='settings.manage' and p.role='admin')));
$$;

create table public.portal_stays (
 id uuid primary key,
 apartment text not null check (apartment=btrim(apartment) and length(apartment) between 1 and 30 and apartment ~ '^[[:alnum:] -]+$'),
 arrival_date date not null check (arrival_date between date '1900-01-01' and date '2099-12-31'),
 departure_date date not null check (departure_date between arrival_date and date '2099-12-31'),
 created_by uuid not null references public.portal_profiles(id) on delete restrict,
 created_at timestamptz not null default now()
);
create index stays_arrival_id on public.portal_stays(arrival_date desc,id);
create index stays_creator on public.portal_stays(created_by);
alter table public.portal_stays enable row level security;
revoke all on public.portal_stays from public,anon,authenticated,service_role;
grant select on public.portal_stays to authenticated;
create policy staff_read_stays on public.portal_stays for select to authenticated
 using ((select private.has_permission('stays.read')));

alter table public.audit_events drop constraint audit_events_entity_type_check;
alter table public.audit_events add constraint audit_events_entity_type_check
 check (entity_type in ('experiences','experience_occurrences','experience_bookings','portal_stays'));
create function private.audit_stay_creation() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.has_permission('stays.manage') then raise exception 'E_FORBIDDEN'; end if;
 -- Apartment is excluded: a registry audit needs identity and dates, not free text.
 insert into public.audit_events(actor_id,action,entity_type,entity_id,after)
 values(auth.uid(),'INSERT','portal_stays',new.id,jsonb_build_object('id',new.id,'arrival_date',new.arrival_date,'departure_date',new.departure_date));
 return null;
end; $$;
revoke all on function private.audit_stay_creation() from public,anon,authenticated,service_role;
create trigger stays_audit after insert on public.portal_stays for each row execute function private.audit_stay_creation();

create function public.portal_create_stay(p_request uuid,p_command jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare previous_id uuid; entity uuid; apartment_value text; arrival date; departure date;
begin
 previous_id:=private.begin_mutation(p_request,p_command,'stays.manage','stay.create');
 if previous_id is not null then return previous_id; end if;
 if p_command-array['id','apartment','arrival_date','departure_date']<>'{}'::jsonb
 or not p_command ?& array['id','apartment','arrival_date','departure_date']
 or exists(select 1 from jsonb_each(p_command) where jsonb_typeof(value)<>'string') then raise exception 'E_INPUT'; end if;
 entity:=(p_command->>'id')::uuid; apartment_value:=btrim(p_command->>'apartment');
 if coalesce(p_command->>'arrival_date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
 or coalesce(p_command->>'departure_date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'E_INPUT'; end if;
 arrival:=(p_command->>'arrival_date')::date; departure:=(p_command->>'departure_date')::date;
 if length(apartment_value) not between 1 and 30 or apartment_value !~ '^[[:alnum:] -]+$'
 or arrival not between date '1900-01-01' and date '2099-12-31'
 or departure not between arrival and date '2099-12-31' then raise exception 'E_INPUT'; end if;
 perform pg_advisory_xact_lock(hashtextextended('portal-stay:'||entity::text,0));
 if exists(select 1 from public.portal_stays where id=entity) then raise exception 'E_VERSION'; end if;
 insert into public.portal_stays(id,apartment,arrival_date,departure_date,created_by)
 values(entity,apartment_value,arrival,departure,auth.uid());
 insert into private.mutation_requests(actor_id,request_id,payload_hash,entity_id,operation)
 values(auth.uid(),p_request,encode(extensions.digest(p_command::text,'sha256'),'hex'),entity,'stay.create');
 return entity;
exception when invalid_text_representation or datetime_field_overflow then raise exception 'E_INPUT';
end; $$;
revoke all on function public.portal_create_stay(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.portal_create_stay(uuid,jsonb) to authenticated;
