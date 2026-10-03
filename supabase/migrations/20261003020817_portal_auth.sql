create type public.portal_role as enum ('recepcao', 'gerencia', 'admin');
create table public.portal_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.portal_role not null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.portal_profiles enable row level security;
revoke all on public.portal_profiles from public, anon, authenticated, service_role;
grant select on public.portal_profiles to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
-- Narrow definer lookup avoids recursive profile RLS and reads protected auth.sessions.
-- Caller identity, live session and staff status are required; no caller-supplied user ID.
create function private.has_permission(permission text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.portal_profiles p
    join auth.sessions s on s.user_id = p.id
    where p.id = (select auth.uid()) and p.active
      and s.id = nullif((select auth.jwt())->>'session_id', '')::uuid
      and (s.not_after is null or s.not_after > now())
      and (
        permission in ('portal.read', 'experiences.read', 'facilities.read', 'osteria.read')
        or (permission in ('experiences.manage', 'weekly_program.manage', 'reports.read')
            and p.role in ('gerencia', 'admin'))
        or (permission = 'settings.manage' and p.role = 'admin')
      )
  );
$$;
revoke all on function private.has_permission(text) from public, anon, authenticated, service_role;
grant execute on function private.has_permission(text) to authenticated;
create policy own_active_profile on public.portal_profiles for select to authenticated
  using (id = (select auth.uid()) and (select private.has_permission('portal.read')));
create policy staff_read_settings on public.portal_settings for select to authenticated
  using ((select private.has_permission('portal.read')));
-- Settings remain immutable in Phase 4; settings.manage protects its route/future operations.
-- Staff provisioning/role changes stay administrative SQL; clients cannot promote themselves.
