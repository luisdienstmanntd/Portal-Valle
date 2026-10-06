begin;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id) values('90000000-0000-4000-8000-000000000001');
insert into auth.sessions(id,user_id) values('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001');
insert into public.portal_profiles(id,role,active) values('90000000-0000-4000-8000-000000000001','recepcao',true);
insert into public.portal_stays(id,apartment,arrival_date,departure_date,created_by) values
 ('92000000-0000-4000-8000-000000000001','TEST-A','2026-10-09','2026-10-12','90000000-0000-4000-8000-000000000001'),
 ('92000000-0000-4000-8000-000000000002','TEST-B','2026-10-09','2026-10-12','90000000-0000-4000-8000-000000000001'),
 ('92000000-0000-4000-8000-000000000003','TEST-A','2026-11-01','2026-11-03','90000000-0000-4000-8000-000000000001');
insert into public.experience_occurrences(id,experience_id,starts_at,ends_at,location,status)
values('93000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','2026-10-10T20:00:00-03','2026-10-10T22:00:00-03','Teste','published');
insert into public.experience_bookings(id,occurrence_id,apartment_number,guest_name,adults,children,units,status) values
 ('94000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001','test-a','Hóspede Fictício',2,0,1,'reserved'),
 ('94000000-0000-4000-8000-000000000002','93000000-0000-4000-8000-000000000001','TEST-A','Hóspede Fictício',2,0,1,'cancelled');
select ok(not has_function_privilege('anon','public.portal_link_booking_stay(uuid,jsonb)','execute'),'Anonymous cannot link');
select ok(not has_function_privilege('service_role','public.portal_link_booking_stay(uuid,jsonb)','execute'),'No administrative linker');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","session_id":"91000000-0000-4000-8000-000000000001"}',true);
select throws_ok($$select public.portal_link_booking_stay(gen_random_uuid(),'{"booking_id":"94000000-0000-4000-8000-000000000001","version":1,"stay_id":"92000000-0000-4000-8000-000000000002"}')$$,'P0001','E_PERIOD','Different apartment refused');
select throws_ok($$select public.portal_link_booking_stay(gen_random_uuid(),'{"booking_id":"94000000-0000-4000-8000-000000000001","version":1,"stay_id":"92000000-0000-4000-8000-000000000003"}')$$,'P0001','E_PERIOD','Session outside period refused');
select throws_ok($$select public.portal_link_booking_stay(gen_random_uuid(),'{"booking_id":"94000000-0000-4000-8000-000000000002","version":1,"stay_id":"92000000-0000-4000-8000-000000000001"}')$$,'P0001','E_CANCELLED','Cancelled booking refused');
select throws_ok($$select public.portal_link_booking_stay(gen_random_uuid(),'{"booking_id":"94000000-0000-4000-8000-000000000001","version":1,"stay_id":"92000000-0000-4000-8000-000000000001","role":"admin"}')$$,'P0001','E_INPUT','Unexpected data refused');
select throws_ok($$select public.portal_link_booking_stay(gen_random_uuid(),'{"booking_id":"94000000-0000-4000-8000-000000000001","version":1,"stay_id":"92000000-0000-4000-8000-0000000000ff"}')$$,'P0001','E_INPUT','Unknown stay refused');
select throws_ok($$select public.portal_link_booking_stay(gen_random_uuid(),'{"booking_id":"94000000-0000-4000-8000-000000000001","version":9,"stay_id":"92000000-0000-4000-8000-000000000001"}')$$,'P0001','E_VERSION','Stale version refused');
select is(public.portal_link_booking_stay('95000000-0000-4000-8000-000000000001','{"booking_id":"94000000-0000-4000-8000-000000000001","version":1,"stay_id":"92000000-0000-4000-8000-000000000001"}'),'94000000-0000-4000-8000-000000000001'::uuid,'Explicit link accepted');
select is(public.portal_link_booking_stay('95000000-0000-4000-8000-000000000001','{"booking_id":"94000000-0000-4000-8000-000000000001","version":1,"stay_id":"92000000-0000-4000-8000-000000000001"}'),'94000000-0000-4000-8000-000000000001'::uuid,'Retry is idempotent');
select is((select version from public.experience_bookings where id='94000000-0000-4000-8000-000000000001'),2,'Version incremented once');
select throws_ok($$select public.portal_link_booking_stay(gen_random_uuid(),'{"booking_id":"94000000-0000-4000-8000-000000000001","version":2,"stay_id":"92000000-0000-4000-8000-000000000001"}')$$,'P0001','E_VERSION','Relinking same stay refused');
select is(public.portal_link_booking_stay(gen_random_uuid(),'{"booking_id":"94000000-0000-4000-8000-000000000001","version":2,"stay_id":null}'),'94000000-0000-4000-8000-000000000001'::uuid,'Unlink accepted');
select throws_ok($$delete from public.portal_stays where id='92000000-0000-4000-8000-000000000001'$$,'42501',null,'Client cannot delete stays');
reset role;
select is((select count(*) from public.audit_events where entity_type='experience_bookings' and after ? 'stay_id'),4::bigint,'Two inserts and both link changes audited with stay_id');
update public.experience_bookings set stay_id='92000000-0000-4000-8000-000000000001' where id='94000000-0000-4000-8000-000000000001';
select throws_ok($$delete from public.portal_stays where id='92000000-0000-4000-8000-000000000001'$$,'23503',null,'Linked stay cannot be deleted');
-- Invariants after linking: the booking is linked to stay 1 here (updated above as postgres).
select throws_ok($$update public.experience_bookings set apartment_number='TEST-B' where id='94000000-0000-4000-8000-000000000001'$$,'P0001','E_PERIOD','Linked booking cannot change apartment');
select throws_ok($$update public.experience_occurrences set starts_at='2026-11-20T20:00:00-03',ends_at='2026-11-20T22:00:00-03' where id='93000000-0000-4000-8000-000000000001'$$,'P0001','E_PERIOD','Reschedule outside stay period refused');
select lives_ok($$update public.experience_occurrences set starts_at='2026-10-11T20:00:00-03',ends_at='2026-10-11T22:00:00-03' where id='93000000-0000-4000-8000-000000000001'$$,'Reschedule inside period allowed');
update public.experience_bookings set status='cancelled' where id='94000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","session_id":"91000000-0000-4000-8000-000000000001"}',true);
select lives_ok($$select public.portal_link_booking_stay(gen_random_uuid(),jsonb_build_object('booking_id','94000000-0000-4000-8000-000000000001','version',(select version from public.experience_bookings where id='94000000-0000-4000-8000-000000000001'),'stay_id',null))$$,'Cancelled booking can be unlinked');
reset role;
select * from finish();
rollback;
