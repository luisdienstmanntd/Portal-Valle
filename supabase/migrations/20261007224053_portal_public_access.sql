-- Public operations explicitly authorized by the owner. No permanent identity required.
alter table public.portal_settings add column public_access boolean not null default false;
create function public.portal_public_access_enabled() returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce((select public_access from public.portal_settings where singleton),false);
$$;
revoke all on function public.portal_public_access_enabled() from public,anon,authenticated,service_role;
grant execute on function public.portal_public_access_enabled() to anon,authenticated;

create function private.provision_public_visitor() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if NEW.is_anonymous and public.portal_public_access_enabled() then
  insert into public.portal_profiles(id,role,active) values(NEW.id,'recepcao',true);
 end if;
 return NEW;
end; $$;
revoke all on function private.provision_public_visitor() from public,anon,authenticated,service_role;
create trigger portal_public_visitor after insert on auth.users
 for each row execute function private.provision_public_visitor();

create or replace function private.has_permission(permission text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.portal_profiles p
 join auth.users u on u.id=p.id join auth.sessions s on s.user_id=p.id
 where p.id=(select auth.uid()) and p.active
 and s.id=nullif((select auth.jwt())->>'session_id','')::uuid
 and (s.not_after is null or s.not_after>now()) and (
  (u.is_anonymous and public.portal_public_access_enabled()
   and permission in ('portal.read','experiences.read','experiences.manage','weekly_program.manage','bookings.manage','facilities.read','osteria.read'))
  or (not u.is_anonymous and (
   permission in ('portal.read','experiences.read','experiences.manage','weekly_program.manage','bookings.manage','facilities.read','osteria.read')
   or (permission='reports.read' and p.role in ('gerencia','admin'))
   or (permission='settings.manage' and p.role='admin')))
 ));
$$;
