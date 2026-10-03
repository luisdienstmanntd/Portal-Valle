begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(22);

select has_table('public', 'portal_settings', 'Portal settings exists');
select col_type_is('public', 'portal_settings', 'created_at', 'timestamp with time zone', 'Instants have timezone');
select is((select timezone from public.portal_settings), 'America/Sao_Paulo', 'Hotel timezone is explicit');
select ok((select relrowsecurity from pg_class where oid = 'public.portal_settings'::regclass), 'RLS enabled');
select ok((select relforcerowsecurity from pg_class where oid = 'public.portal_settings'::regclass), 'RLS forced');
select ok(not has_table_privilege('anon', 'public.portal_settings', 'select'), 'Anonymous read not granted');
select ok(has_table_privilege('authenticated', 'public.portal_settings', 'select'), 'Authenticated read goes through RLS');
select ok(not has_table_privilege('authenticated', 'public.portal_settings', 'insert'), 'Insert not granted');
select ok(not has_table_privilege('authenticated', 'public.portal_settings', 'update'), 'Update not granted');
select ok(not has_table_privilege('authenticated', 'public.portal_settings', 'delete'), 'Delete not granted');
select is((select count(*) from pg_policy where polrelid = 'public.portal_settings'::regclass), 1::bigint, 'Settings have only the staff read policy');

set local role anon;
select throws_ok('select * from public.portal_settings', '42501', 'permission denied for table portal_settings', 'Anonymous query denied');
reset role;
set local role authenticated;
select is((select count(*) from public.portal_settings), 0::bigint, 'Authentication alone exposes no settings');
select throws_ok($$update public.portal_settings set timezone = 'UTC'$$, '42501', 'permission denied for table portal_settings', 'Authenticated mutation denied');
select throws_ok($$insert into public.portal_settings(singleton) values(true)$$, '42501', 'permission denied for table portal_settings', 'Authenticated insert denied');
reset role;

select ok(not has_schema_privilege('authenticated', 'public', 'create'), 'Client cannot create objects');
create table public.phase3_grant_probe (id integer);
create function public.phase3_grant_probe() returns integer language sql as 'select 1';
select ok(not has_table_privilege('anon', 'public.phase3_grant_probe', 'select'), 'Future tables private for anon');
select ok(not has_table_privilege('authenticated', 'public.phase3_grant_probe', 'select'), 'Future tables private for authenticated');
select ok(not has_function_privilege('anon', 'public.phase3_grant_probe()', 'execute'), 'Future functions private for anon');
select ok(not has_function_privilege('authenticated', 'public.phase3_grant_probe()', 'execute'), 'Future functions private for authenticated');
select throws_ok($$insert into public.portal_settings(singleton) values (true)$$, '23505', null, 'Settings cannot be duplicated');
select throws_ok($$update public.portal_settings set timezone = 'UTC'$$, '23514', null, 'Hotel timezone constraint enforced');
select * from finish();
rollback;
