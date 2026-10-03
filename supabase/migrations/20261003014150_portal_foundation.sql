-- Portal-only foundation. No legacy resources or guest data.
-- New objects must receive explicit grants in their own migrations.
revoke create on schema public from public, anon, authenticated;
-- Supabase's automatic table/sequence grants are scoped to public.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, service_role;
-- Function EXECUTE is granted to PUBLIC globally by PostgreSQL; revoke globally.
alter default privileges for role postgres
  revoke execute on functions from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;

create table public.portal_settings (
  singleton boolean primary key default true check (singleton),
  timezone text not null default 'America/Sao_Paulo'
    check (timezone = 'America/Sao_Paulo'),
  created_at timestamptz not null default now()
);
comment on table public.portal_settings is
  'Portal operational settings. Staff policies are introduced in Phase 4.';
alter table public.portal_settings enable row level security;
alter table public.portal_settings force row level security;
revoke all on table public.portal_settings from public, anon, authenticated, service_role;
grant select on table public.portal_settings to authenticated;
-- No policies: authenticated users also see no rows until staff authorization exists.
insert into public.portal_settings (singleton, timezone)
values (true, 'America/Sao_Paulo');
