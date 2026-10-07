begin;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id) values('90000000-0000-4000-8000-000000000001');
insert into auth.sessions(id,user_id) values('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001');
insert into public.portal_profiles(id,role,active) values('90000000-0000-4000-8000-000000000001','recepcao',true);
create temporary table reception_commands(kind text primary key, command jsonb);
grant select on reception_commands to authenticated;
insert into reception_commands values
('session','{"action":"save","id":"92000000-0000-4000-8000-000000000001","version":0,"experience_id":"c8000000-0000-4000-8000-000000000001","title":"Pizza teste","location":"Local teste","starts_at":"2026-10-10T22:00:00Z","ends_at":"2026-10-11T00:00:00Z","capacity":20,"person_limit":20,"status":"published"}'),
('booking','{"action":"save","id":"93000000-0000-4000-8000-000000000001","version":0,"occurrence_id":"92000000-0000-4000-8000-000000000001","adults":18,"children":2,"apartment_number":"TEST","guest_name":"Pessoa fictícia","status":"reserved","attendance_status":"pending"}');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","session_id":"91000000-0000-4000-8000-000000000001"}',true);
select ok(private.has_permission('weekly_program.manage'),'Reception manages programming');
select ok(not private.has_permission('settings.manage'),'Reception cannot manage settings');
select lives_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command from reception_commands where kind='session'))$$,'Reception creates Pizza for twenty');
select lives_ok($$select public.portal_pizza_save_booking(gen_random_uuid(),(select command from reception_commands where kind='booking'))$$,'Adults and children fill twenty places');
select throws_ok($$select public.portal_pizza_save_booking(gen_random_uuid(),(select command||'{"id":"93000000-0000-4000-8000-000000000002","adults":1,"children":1}'::jsonb from reception_commands where kind='booking'))$$,'P0001','E_CAPACITY','Children count towards aggregate capacity');
select lives_ok($$select public.portal_pizza_save_booking('94000000-0000-4000-8000-000000000001',(select command||'{"id":"93000000-0000-4000-8000-000000000002","adults":1,"children":1,"exception_reason":"Exceção autorizada para teste"}'::jsonb from reception_commands where kind='booking'))$$,'Reception authorizes justified exception');
select lives_ok($$select public.portal_pizza_save_booking('94000000-0000-4000-8000-000000000001',(select command||'{"id":"93000000-0000-4000-8000-000000000002","adults":1,"children":1,"exception_reason":"Exceção autorizada para teste"}'::jsonb from reception_commands where kind='booking'))$$,'Exception retry is idempotent');
select is((select sum(adults+children)::integer from public.experience_bookings where occurrence_id='92000000-0000-4000-8000-000000000001'),22,'Exception records twenty-two people');
select lives_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command||'{"version":1,"location":"Local atualizado"}'::jsonb from reception_commands where kind='session'))$$,'Overbooked session remains editable without reducing limits');
select throws_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command||'{"version":2,"capacity":19,"person_limit":19}'::jsonb from reception_commands where kind='session'))$$,'P0001','E_CAPACITY','Cannot reduce overbooked limits');
reset role;
select ok(exists(select 1 from public.audit_events where actor_id='90000000-0000-4000-8000-000000000001' and after->>'exception_reason'='Exceção autorizada para teste'),'Exception reason and actor audited');
select * from finish();
rollback;
