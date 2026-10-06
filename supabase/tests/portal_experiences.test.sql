begin;
set local search_path = public, extensions;
select no_plan();
-- Isolate the Phase 5 synthetic fixture from the new fixed Cine catalogue; rollback restores it.
delete from public.experiences where slug in ('cine-toscana','la-vera-pizza');
delete from public.audit_events;
insert into auth.users(id) values ('50000000-0000-4000-8000-000000000001'),('50000000-0000-4000-8000-000000000002'),('50000000-0000-4000-8000-000000000003');
insert into auth.sessions(id,user_id) values
 ('51000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001'),
 ('51000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000002'),
 ('51000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000003');
insert into public.portal_profiles(id,role,active) values
 ('50000000-0000-4000-8000-000000000001','admin',true),
 ('50000000-0000-4000-8000-000000000002','recepcao',true),
 ('50000000-0000-4000-8000-000000000003','admin',false);
insert into public.experiences(id,slug,name,category,booking_mode,capacity_mode,default_capacity,person_limit)
 values ('52000000-0000-4000-8000-000000000001','test-cinema','Cinema fictício','cinema','group','units',4,8);
insert into public.experience_occurrences(id,experience_id,starts_at,ends_at,location)
 values ('53000000-0000-4000-8000-000000000001','52000000-0000-4000-8000-000000000001',
 '2026-10-08 19:30-03','2026-10-08 21:30-03','Local fictício');
insert into public.experience_bookings(id,occurrence_id,apartment_number,guest_name,guest_phone,adults,children,units,notes,created_by,updated_at)
 values ('54000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000001','TEST','Pessoa fictícia','TEST-PHONE',2,0,1,'TEST-NOTE',
 '50000000-0000-4000-8000-000000000001','2020-01-01Z');

select ok((select relrowsecurity from pg_class where oid=('public.'||name)::regclass),name||' RLS')
 from unnest(array['experiences','experience_occurrences','experience_bookings','audit_events']) name;
select ok(not has_table_privilege('anon','public.'||name,'select'),name||' anon denied')
 from unnest(array['experiences','experience_occurrences','experience_bookings','audit_events']) name;
select ok(not has_table_privilege('authenticated','public.'||name,'insert,update,delete'),name||' client writes closed')
 from unnest(array['experiences','experience_occurrences','experience_bookings','audit_events']) name;
select ok(not has_function_privilege('authenticated','private.audit_experience_change()','execute'),'Audit helper not callable');
select is((select count(*) from public.audit_events),3::bigint,'All three model writes audited');
select ok((select bool_and(actor_id is null) from public.audit_events),'Administrative SQL without Auth is explicitly system actor');
select ok((select bool_and(not after ?| array['guest_name','guest_phone','apartment_number','notes','description','metadata','name','location']) from public.audit_events),'Audit excludes PII/free text');
select is((select default_capacity from public.experiences),4,'Units distinct from person limit');
select is((select person_limit from public.experiences),8,'Physical person limit retained');
select is((select starts_at from public.experience_occurrences),'2026-10-08 22:30Z'::timestamptz,'Hotel offset preserved as instant');
select throws_ok($$update public.experience_occurrences set ends_at=starts_at$$,'23514',null,'End must follow start');
select throws_ok($$update public.experiences set slug='bad slug'$$,'23514',null,'Slug constrained');
select throws_ok($$update public.experiences set default_capacity=null$$,'23514',null,'Limited capacity needs quantity');
select throws_ok($$update public.experiences set guest_bookable=true$$,'23514',null,'Public booking not enabled prematurely');
select throws_ok($$update public.experience_bookings set adults=-1$$,'23514',null,'Negative persons refused');
select throws_ok($$update public.experience_bookings set adults=0,children=0$$,'23514',null,'Empty group refused');
select throws_ok($$update public.experience_bookings set stay_id=gen_random_uuid()$$,'23503',null,'Unknown stay refused');
select throws_ok($$update public.experience_occurrences set metadata='{"guest_phone":"test"}'$$,'23514',null,'Metadata allowlist');
select throws_ok($$delete from public.experiences$$,'23503',null,'No orphan occurrences');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"50000000-0000-4000-8000-000000000002","session_id":"51000000-0000-4000-8000-000000000002"}',true);
select is((select count(*) from public.experiences),1::bigint,'Reception reads catalogue');
select is((select count(*) from public.experience_occurrences),1::bigint,'Reception reads occurrences');
select is((select count(*) from public.experience_bookings),1::bigint,'Reception reads staff bookings');
select is((select count(*) from public.audit_events),0::bigint,'Reception cannot read audit');
select throws_ok($$update public.experience_bookings set adults=8$$,'42501',null,'No direct booking mutation bypass');
select set_config('request.jwt.claims','{"sub":"50000000-0000-4000-8000-000000000003","session_id":"51000000-0000-4000-8000-000000000003"}',true);
select is((select count(*) from public.experience_bookings),0::bigint,'Inactive staff denied');
reset role;
select set_config('request.jwt.claims','{"sub":"50000000-0000-4000-8000-000000000003","session_id":"51000000-0000-4000-8000-000000000003"}',true);
select throws_ok($$update public.experience_bookings set status='confirmed'$$,'42501',null,'Trigger also rejects unauthorized actor');
select set_config('request.jwt.claims','{"sub":"50000000-0000-4000-8000-000000000001","session_id":"51000000-0000-4000-8000-000000000001"}',true);
update public.experience_bookings set status='confirmed',attendance_status='absent';
select is((select count(*) from public.audit_events),4::bigint,'Update audited once');
select is((select actor_id from public.audit_events where action='UPDATE'),'50000000-0000-4000-8000-000000000001'::uuid,'Actor comes from Auth context');
select is((select before->>'status' from public.audit_events where action='UPDATE'),'reserved','Before recorded');
select is((select after->>'status' from public.audit_events where action='UPDATE'),'confirmed','After recorded');
select is((select attendance_status::text from public.experience_bookings),'absent','Presence independent of confirmed status');
select ok((select updated_at > '2020-01-01Z' from public.experience_bookings),'Updated timestamp touched');
set local role authenticated;
select is((select count(*) from public.audit_events),4::bigint,'Admin sees audit with live session');
select throws_ok($$delete from public.audit_events$$,'42501',null,'Audit cannot be erased by client admin');
reset role;

-- Deliberately fail audit insertion inside the same local test transaction.
create function private.phase5_fail_audit() returns trigger language plpgsql as $$
begin raise exception 'Synthetic audit failure'; end; $$;
create trigger phase5_fail_audit before insert on public.audit_events for each row execute function private.phase5_fail_audit();
select throws_ok($$update public.experience_bookings set status='cancelled'$$,'P0001','Synthetic audit failure','Audit failure aborts business mutation');
select is((select status::text from public.experience_bookings),'confirmed','Business change rolled back with audit');
select is((select count(*) from public.audit_events),4::bigint,'Failed transaction adds no audit');
drop trigger phase5_fail_audit on public.audit_events;
delete from public.experience_bookings;
select is((select count(*) from public.audit_events where action='DELETE'),1::bigint,'Deletion preserves audit');
select ok((select after is null and before->>'status'='confirmed' from public.audit_events where action='DELETE'),'Delete records before only');
delete from auth.sessions where user_id='50000000-0000-4000-8000-000000000001';
set local role authenticated;
select is((select count(*) from public.experiences),0::bigint,'Revoked session cannot read model');
select is((select count(*) from public.audit_events),0::bigint,'Revoked session cannot read audit');
select * from finish();
rollback;
