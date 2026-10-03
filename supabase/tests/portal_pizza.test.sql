begin;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id) values('80000000-0000-4000-8000-000000000001'),('80000000-0000-4000-8000-000000000002');
insert into auth.sessions(id,user_id) values
 ('81000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000001'),
 ('81000000-0000-4000-8000-000000000002','80000000-0000-4000-8000-000000000002');
insert into public.portal_profiles(id,role,active) values('80000000-0000-4000-8000-000000000001','gerencia',true),('80000000-0000-4000-8000-000000000002','recepcao',true);
create temporary table pizza_commands(kind text primary key,command jsonb);
grant select on pizza_commands to authenticated;
insert into public.experiences(id,slug,name,category,booking_mode,capacity_mode,default_capacity,person_limit,active)
 values('c8000000-0000-4000-8000-000000000002','test-other-gastronomy','Outra experiência fictícia','gastronomy','group','persons',12,12,true);
insert into pizza_commands values
 ('occurrence','{"action":"save","id":"82000000-0000-4000-8000-000000000001","version":0,"experience_id":"c8000000-0000-4000-8000-000000000001","title":"Evento fictício SQL","location":"Local fictício SQL","starts_at":"2026-10-10T22:00:00Z","ends_at":"2026-10-11T00:00:00Z","capacity":12,"person_limit":12,"status":"published"}'),
 ('booking','{"action":"save","id":"83000000-0000-4000-8000-000000000001","version":0,"occurrence_id":"82000000-0000-4000-8000-000000000001","adults":2,"children":0,"apartment_number":"TEST","guest_name":"Pessoa fictícia PizzaSQL","notes":"CHD 2 anos","status":"reserved","attendance_status":"pending"}');
select ok(not exists(select 1 from information_schema.columns where table_schema='public' and table_name='experiences' and column_name='children_allowed'),'No misleading child admission flag');
select is((select default_capacity from public.experiences where slug='la-vera-pizza'),12,'Pizza adult capacity supplied by owner');
select is((select count(*) from public.experiences where category='wine'),0::bigint,'Lora remains deferred');
select ok(not has_function_privilege('anon','public.portal_pizza_save_booking(uuid,jsonb)','execute'),'Anon cannot write Pizza');
select ok(not has_function_privilege('authenticated','private.save_booking(uuid,jsonb,public.experience_category,text)','execute'),'Shared helper not callable by client');
select throws_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command from pizza_commands where kind='occurrence'))$$,'P0001','E_FORBIDDEN','Auth missing rejects Pizza operation');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"80000000-0000-4000-8000-000000000002","session_id":"81000000-0000-4000-8000-000000000002"}',true);
select throws_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command from pizza_commands where kind='occurrence'))$$,'P0001','E_FORBIDDEN','Reception cannot create Pizza session');
select set_config('request.jwt.claims','{"sub":"80000000-0000-4000-8000-000000000001","session_id":"81000000-0000-4000-8000-000000000001"}',true);
select lives_ok($$select public.portal_pizza_save_occurrence('84000000-0000-4000-8000-000000000001',(select command from pizza_commands where kind='occurrence'))$$,'Manager creates Pizza event');
select throws_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command||'{"id":"82000000-0000-4000-8000-000000000002","experience_id":"c8000000-0000-4000-8000-000000000002"}'::jsonb from pizza_commands where kind='occurrence'))$$,'P0001','E_CONFIGURATION','Pizza wrapper cannot create a different gastronomy catalogue session');
select throws_ok($$select public.portal_save_occurrence('84000000-0000-4000-8000-000000000001',(select command from pizza_commands where kind='occurrence'))$$,'P0001','E_IDEMPOTENCY','Same payload/key cannot replay through Cine wrapper');
select throws_ok($$select public.portal_save_occurrence(gen_random_uuid(),(select command from pizza_commands where kind='occurrence'))$$,'P0001','E_CONFIGURATION','Cine wrapper cannot mutate Pizza');
select throws_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command||'{"version":1,"film_title":"Film"}'::jsonb from pizza_commands where kind='occurrence'))$$,'P0001','E_INPUT','Pizza refuses cinema-only field');
select throws_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command||'{"version":1,"price":100}'::jsonb from pizza_commands where kind='occurrence'))$$,'P0001','E_INPUT','No financial command accepted');
select set_config('request.jwt.claims','{"sub":"80000000-0000-4000-8000-000000000002","session_id":"81000000-0000-4000-8000-000000000002"}',true);
select lives_ok($$select public.portal_pizza_save_booking('84000000-0000-4000-8000-000000000002',(select command from pizza_commands where kind='booking'))$$,'Reception reserves adult places with child note');
select is((select adults from public.experience_bookings where id='83000000-0000-4000-8000-000000000001'),2,'Only two adults occupy places');
select is((select children from public.experience_bookings where id='83000000-0000-4000-8000-000000000001'),0,'Structured child count disabled');
select is((select notes from public.experience_bookings where id='83000000-0000-4000-8000-000000000001'),'CHD 2 anos','Child age retained only in notes');
select is((select units from public.experience_bookings where id='83000000-0000-4000-8000-000000000001'),0,'Pizza has no puffs allocation');
select throws_ok($$select public.portal_save_booking('84000000-0000-4000-8000-000000000002',(select command from pizza_commands where kind='booking'))$$,'P0001','E_IDEMPOTENCY','Booking receipt scoped to operation/domain');
select throws_ok($$select public.portal_pizza_save_booking(gen_random_uuid(),(select command||'{"version":1,"children":1}'::jsonb from pizza_commands where kind='booking'))$$,'P0001','E_INPUT','Children must use notes, never structured count');
select lives_ok($$select public.portal_pizza_save_booking(gen_random_uuid(),(select command||'{"version":1,"adults":12}'::jsonb from pizza_commands where kind='booking'))$$,'Twelve adult places fit');
select throws_ok($$select public.portal_pizza_save_booking(gen_random_uuid(),(select command||'{"id":"83000000-0000-4000-8000-000000000002","adults":1}'::jsonb from pizza_commands where kind='booking'))$$,'P0001','E_CAPACITY','Thirteenth adult refused');
select set_config('request.jwt.claims','{"sub":"80000000-0000-4000-8000-000000000001","session_id":"81000000-0000-4000-8000-000000000001"}',true);
select throws_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),(select command||'{"version":1,"capacity":11}'::jsonb from pizza_commands where kind='occurrence'))$$,'P0001','E_CAPACITY','Cannot reduce below adult occupancy');
select lives_ok($$select public.portal_pizza_save_occurrence(gen_random_uuid(),' {"action":"cancel","id":"82000000-0000-4000-8000-000000000001","version":1,"experience_id":"c8000000-0000-4000-8000-000000000001"}')$$,'Cancel event atomically');
select is((select status::text from public.experience_bookings where id='83000000-0000-4000-8000-000000000001'),'cancelled','Event cancellation cancels bookings');
select is((select notes from public.experience_bookings where id='83000000-0000-4000-8000-000000000001'),'CHD 2 anos','Cancellation preserves observations/history');
reset role;
select set_config('request.jwt.claims','{}',true);
select throws_ok($$update public.experience_bookings set units=1 where id='83000000-0000-4000-8000-000000000001'$$,'23514','E_UNITS','Persons booking cannot claim puff units');
select ok((select bool_and(not after ?| array['guest_name','notes','apartment_number','title_override','metadata']) from public.audit_events),'Audit excludes names/notes/ages/title');
select is((select operation from private.mutation_requests where request_id='84000000-0000-4000-8000-000000000002'),'gastronomy.la-vera-pizza.booking','Receipt records operation category');
select * from finish();
rollback;
