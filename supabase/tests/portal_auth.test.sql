begin;
set local search_path = public, extensions;
select no_plan();
insert into auth.users(id) select ('00000000-0000-0000-0000-00000000000' || n)::uuid from generate_series(1,5) n;
insert into auth.sessions(id,user_id)
 select ('11111111-1111-1111-1111-11111111111' || n)::uuid, ('00000000-0000-0000-0000-00000000000' || n)::uuid from generate_series(1,5) n;
insert into public.portal_profiles(id,role,active) values
 ('00000000-0000-0000-0000-000000000001','recepcao',true),
 ('00000000-0000-0000-0000-000000000002','gerencia',true),
 ('00000000-0000-0000-0000-000000000003','admin',true),
 ('00000000-0000-0000-0000-000000000004','admin',false);
select ok(not has_table_privilege('anon','public.portal_profiles','select'),'Anon cannot read profiles');
select ok(not has_table_privilege('authenticated','public.portal_profiles','update'),'No client self-promotion');
select ok(not has_table_privilege('authenticated','public.portal_profiles','insert'),'No client provisioning');
select ok(not has_function_privilege('anon','private.has_permission(text)','execute'),'Private authorization not public');
select ok((select relrowsecurity from pg_class where oid='public.portal_profiles'::regclass),'Profile RLS enabled');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","session_id":"11111111-1111-1111-1111-111111111111","user_metadata":{"role":"admin"}}',true);
select is(private.has_permission(permission), expected, 'recepcao '||permission) from (values
 ('portal.read',true),('experiences.read',true),('experiences.manage',true),('weekly_program.manage',true),
 ('facilities.read',true),('osteria.read',true),('reports.read',false),('settings.manage',false)) as matrix(permission,expected);
select is((select count(*) from public.portal_profiles),1::bigint,'Only own active profile visible');
select is((select count(*) from public.portal_settings),1::bigint,'Active reception sees settings');
select throws_ok($$update public.portal_profiles set role='admin'$$,'42501',null,'Cannot promote self');
select ok(not private.has_permission('unknown'),'Unknown permission denied');

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000002","session_id":"11111111-1111-1111-1111-111111111112"}',true);
select is(private.has_permission(permission), expected, 'gerencia '||permission) from (values
 ('portal.read',true),('experiences.read',true),('experiences.manage',true),('weekly_program.manage',true),
 ('facilities.read',true),('osteria.read',true),('reports.read',true),('settings.manage',false)) as matrix(permission,expected);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000003","session_id":"11111111-1111-1111-1111-111111111113"}',true);
select ok(private.has_permission(permission),'admin '||permission) from unnest(array['portal.read','experiences.read','experiences.manage','weekly_program.manage','facilities.read','osteria.read','reports.read','settings.manage']) permission;
select throws_ok($$update public.portal_settings set timezone='UTC'$$,'42501',null,'Settings immutable even for admin');

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000004","session_id":"11111111-1111-1111-1111-111111111114"}',true);
select ok(not private.has_permission('portal.read'),'Inactive profile denied');
select is((select count(*) from public.portal_profiles),0::bigint,'Inactive profile not exposed');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000005","session_id":"11111111-1111-1111-1111-111111111115"}',true);
select ok(not private.has_permission('portal.read'),'User without staff profile denied');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","session_id":"11111111-1111-1111-1111-111111111113"}',true);
select ok(not private.has_permission('portal.read'),'Session belonging to another user denied');
reset role;
delete from auth.sessions where id='11111111-1111-1111-1111-111111111111';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","session_id":"11111111-1111-1111-1111-111111111111"}',true);
select ok(not private.has_permission('portal.read'),'Revoked session denies still-valid claims');
select is((select count(*) from public.portal_settings),0::bigint,'Revoked session sees no settings');
reset role;
update auth.sessions set not_after=now()-interval '1 minute' where id='11111111-1111-1111-1111-111111111113';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000003","session_id":"11111111-1111-1111-1111-111111111113"}',true);
select ok(not private.has_permission('settings.manage'),'Timeboxed session expired');
select * from finish();
rollback;
