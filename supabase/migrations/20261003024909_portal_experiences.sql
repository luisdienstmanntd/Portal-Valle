-- Model only. Client writes stay closed until atomic capacity/idempotency RPCs in Phase 6.
create type public.experience_category as enum ('wine','cinema','gastronomy','wellness','leisure','other');
create type public.capacity_mode as enum ('persons','bookings','units','unlimited');
create type public.occurrence_status as enum ('draft','published','cancelled','completed');
create type public.booking_status as enum ('reserved','confirmed','cancelled','no_show');
create type public.attendance_status as enum ('pending','present','absent');

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 1 and 160),
  description text check (length(description) <= 4000),
  category public.experience_category not null,
  booking_mode text not null check (booking_mode = 'group'),
  capacity_mode public.capacity_mode not null,
  default_capacity integer check (default_capacity between 0 and 10000),
  person_limit integer check (person_limit between 0 and 10000),
  active boolean not null default false,
  guest_bookable boolean not null default false check (not guest_bookable),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((capacity_mode = 'unlimited') = (default_capacity is null))
);
create table public.experience_occurrences (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete restrict,
  starts_at timestamptz not null, ends_at timestamptz not null check (ends_at > starts_at),
  location text not null check (length(btrim(location)) between 1 and 160),
  capacity_override integer check (capacity_override between 0 and 10000),
  person_limit_override integer check (person_limit_override between 0 and 10000),
  status public.occurrence_status not null default 'draft',
  title_override text check (length(btrim(title_override)) between 1 and 160),
  description_override text check (length(description_override) <= 4000),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (jsonb_typeof(metadata) = 'object' and metadata - 'film_title' = '{}'::jsonb
    and (not metadata ? 'film_title' or (jsonb_typeof(metadata->'film_title') = 'string'
      and length(btrim(metadata->>'film_title')) between 1 and 160)))
);
create table public.experience_bookings (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.experience_occurrences(id) on delete restrict,
  stay_id uuid check (stay_id is null), -- Future Phase 15; no premature cross-project/PMS FK.
  apartment_number text not null check (length(btrim(apartment_number)) between 1 and 30),
  guest_name text not null check (length(btrim(guest_name)) between 1 and 160),
  guest_phone text check (length(btrim(guest_phone)) between 1 and 40),
  adults integer not null check (adults between 0 and 10000),
  children integer not null check (children between 0 and 10000),
  units integer not null check (units between 0 and 10000),
  notes text check (length(notes) <= 2000),
  status public.booking_status not null default 'reserved',
  attendance_status public.attendance_status not null default 'pending',
  created_by uuid references public.portal_profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (adults + children > 0)
);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.portal_profiles(id) on delete set null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  entity_type text not null check (entity_type in ('experiences','experience_occurrences','experience_bookings')),
  entity_id uuid not null,
  before jsonb check (before is null or jsonb_typeof(before) = 'object'),
  after jsonb check (after is null or jsonb_typeof(after) = 'object'),
  created_at timestamptz not null default now()
);
create index occurrences_experience_start on public.experience_occurrences(experience_id, starts_at);
create index occurrences_start on public.experience_occurrences(starts_at);
create index bookings_occurrence on public.experience_bookings(occurrence_id);
create index bookings_creator on public.experience_bookings(created_by);
create index audit_actor on public.audit_events(actor_id);
create index audit_entity_time on public.audit_events(entity_type, entity_id, created_at);

alter table public.experiences enable row level security;
alter table public.experience_occurrences enable row level security;
alter table public.experience_bookings enable row level security;
alter table public.audit_events enable row level security;
revoke all on public.experiences, public.experience_occurrences, public.experience_bookings, public.audit_events
  from public, anon, authenticated, service_role;
grant select on public.experiences, public.experience_occurrences, public.experience_bookings, public.audit_events to authenticated;
create policy staff_read_experiences on public.experiences for select to authenticated
  using ((select private.has_permission('experiences.read')));
create policy staff_read_occurrences on public.experience_occurrences for select to authenticated
  using ((select private.has_permission('experiences.read')));
create policy staff_read_bookings on public.experience_bookings for select to authenticated
  using ((select private.has_permission('experiences.read')));
create policy admin_read_audit on public.audit_events for select to authenticated
  using ((select private.has_permission('settings.manage')));

create function private.touch_experience_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function private.touch_experience_updated_at() from public, anon, authenticated, service_role;
create trigger experiences_updated before update on public.experiences for each row execute function private.touch_experience_updated_at();
create trigger occurrences_updated before update on public.experience_occurrences for each row execute function private.touch_experience_updated_at();
create trigger bookings_updated before update on public.experience_bookings for each row execute function private.touch_experience_updated_at();

-- Definer is necessary only for the trigger to insert into immutable audit_events.
-- No direct EXECUTE grant; fixed tables and explicit field allowlist, never free text/PII.
create function private.audit_experience_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid(); old_data jsonb; new_data jsonb; entity uuid;
  safe_fields text[] := array['id','experience_id','occurrence_id','category','booking_mode','capacity_mode',
    'default_capacity','person_limit','active','guest_bookable','starts_at','ends_at',
    'capacity_override','person_limit_override','status','attendance_status','adults','children','units'];
begin
  if actor is not null and not private.has_permission('experiences.manage') then
    raise insufficient_privilege using message = 'Operador sem permissão para alteração de experiências.';
  end if;
  if TG_OP <> 'INSERT' then
    select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into old_data
      from jsonb_each(to_jsonb(OLD)) where key = any(safe_fields);
  end if;
  if TG_OP = 'DELETE' then entity := OLD.id; else entity := NEW.id; end if;
  if TG_OP <> 'DELETE' then
    select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into new_data
      from jsonb_each(to_jsonb(NEW)) where key = any(safe_fields);
  end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,before,after)
    values(actor,TG_OP,TG_TABLE_NAME,entity,old_data,new_data);
  return null;
end;
$$;
revoke all on function private.audit_experience_change() from public, anon, authenticated, service_role;
create trigger experiences_audit after insert or update or delete on public.experiences for each row execute function private.audit_experience_change();
create trigger occurrences_audit after insert or update or delete on public.experience_occurrences for each row execute function private.audit_experience_change();
create trigger bookings_audit after insert or update or delete on public.experience_bookings for each row execute function private.audit_experience_change();
