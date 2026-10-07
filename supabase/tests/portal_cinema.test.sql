begin;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id) values ('60000000-0000-4000-8000-000000000001'),('60000000-0000-4000-8000-000000000002');
insert into auth.sessions(id,user_id) values
 ('61000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001'),
 ('61000000-0000-4000-8000-000000000002','60000000-0000-4000-8000-000000000002');
insert into public.portal_profiles(id,role,active) values
 ('60000000-0000-4000-8000-000000000001','gerencia',true),
 ('60000000-0000-4000-8000-000000000002','recepcao',true);
create temporary table cinema_commands(kind text primary key, command jsonb);
grant select on cinema_commands to authenticated;
insert into cinema_commands values
 ('occurrence','{"action":"save","id":"62000000-0000-4000-8000-000000000001","version":0,"experience_id":"c1000000-0000-4000-8000-000000000001","starts_at":"2026-10-08T22:30:00Z","ends_at":"2026-10-09T00:30:00Z","location":"Local fictício SQL","film_title":"Filme fictício SQL","capacity":4,"person_limit":8,"status":"published"}'),
 ('booking','{"action":"save","id":"63000000-0000-4000-8000-000000000001","version":0,"occurrence_id":"62000000-0000-4000-8000-000000000001","adults":1,"children":0,"apartment_number":"TEST","guest_name":"Pessoa fictícia SQL","notes":"Observação fictícia SQL","status":"reserved","attendance_status":"pending"}');
select ok(not has_function_privilege('anon','public.portal_save_booking(uuid,jsonb)','execute'),'Anon cannot execute booking RPC');
select ok(not has_function_privilege('service_role','public.portal_save_booking(uuid,jsonb)','execute'),'Service role not an operational writer');
select ok(not has_function_privilege('authenticated','private.begin_mutation(uuid,jsonb,text,text)','execute'),'Idempotency helper private');
select ok(not has_table_privilege('authenticated','private.mutation_requests','select,insert,update,delete'),'Client cannot access idempotency store');
select throws_ok($$select public.portal_save_occurrence(gen_random_uuid(),(select command from cinema_commands where kind='occurrence'))$$,'P0001','E_FORBIDDEN','RPC rejects missing Auth even under SQL owner');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"60000000-0000-4000-8000-000000000002","session_id":"61000000-0000-4000-8000-000000000002"}',true);
select ok(private.has_permission('experiences.manage'),'Reception can manage sessions');
select set_config('request.jwt.claims','{"sub":"60000000-0000-4000-8000-000000000001","session_id":"61000000-0000-4000-8000-000000000001"}',true);
select is(public.portal_save_occurrence('64000000-0000-4000-8000-000000000001',(select command from cinema_commands where kind='occurrence')),'62000000-0000-4000-8000-000000000001'::uuid,'Manager creates session');
select is(public.portal_save_occurrence('64000000-0000-4000-8000-000000000001',(select command from cinema_commands where kind='occurrence')),'62000000-0000-4000-8000-000000000001'::uuid,'Retry returns same entity');
select throws_ok($$select public.portal_save_occurrence('64000000-0000-4000-8000-000000000001',(select command||'{"film_title":"Changed"}'::jsonb from cinema_commands where kind='occurrence'))$$,'P0001','E_IDEMPOTENCY','Key rejects changed payload');
select set_config('request.jwt.claims','{"sub":"60000000-0000-4000-8000-000000000002","session_id":"61000000-0000-4000-8000-000000000002"}',true);
select is(public.portal_save_booking('64000000-0000-4000-8000-000000000002',(select command from cinema_commands where kind='booking')),'63000000-0000-4000-8000-000000000001'::uuid,'Reception books adult');
select is((select units from public.experience_bookings where id='63000000-0000-4000-8000-000000000001'),1,'One adult consumes one exclusive puff');
select throws_ok($$select public.portal_save_booking(gen_random_uuid(),(select command||'{"version":1,"children":1}'::jsonb from cinema_commands where kind='booking'))$$,'P0001','E_INPUT','Structured child count rejected by RPC');
select throws_ok($$select public.portal_save_booking(gen_random_uuid(),(select command||'{"version":1,"units":0}'::jsonb from cinema_commands where kind='booking'))$$,'P0001','E_INPUT','Client cannot override units');
select lives_ok($$select public.portal_save_booking(gen_random_uuid(),(select command||'{"version":1,"adults":8}'::jsonb from cinema_commands where kind='booking'))$$,'Eight adults fit four puffs');
select is((select units from public.experience_bookings where id='63000000-0000-4000-8000-000000000001'),4,'Eight adults consume four puffs');
select throws_ok($$select public.portal_save_booking(gen_random_uuid(),(select command||'{"version":1,"adults":2}'::jsonb from cinema_commands where kind='booking'))$$,'P0001','E_VERSION','Stale version refused');
reset role;
select is((select responsible_id from public.experience_occurrences where id='62000000-0000-4000-8000-000000000001'),'60000000-0000-4000-8000-000000000001'::uuid,'Responsible comes from individual login');
select is((select count(*) from private.mutation_requests),3::bigint,'Only successful unique commands retained');
select ok((select bool_and(length(payload_hash)=64) from private.mutation_requests),'Payload retained only as SHA256');
select ok((select bool_and(not after ?| array['guest_name','notes','apartment_number','metadata','location']) from public.audit_events),'Audit excludes free text');
select set_config('request.jwt.claims','{}',true);
select throws_ok($$update public.experience_bookings set children=1 where id='63000000-0000-4000-8000-000000000001'$$,'23514','E_CHILDREN','Structured child count disabled even in privileged SQL');
select throws_ok($$update public.experience_bookings set units=1 where id='63000000-0000-4000-8000-000000000001'$$,'23514','E_UNITS','Direct SQL cannot misstate puff quantity');
create function private.phase6_fail_audit() returns trigger language plpgsql as $$begin raise exception 'Synthetic audit failure'; end;$$;
create trigger phase6_fail_audit before insert on public.audit_events for each row execute function private.phase6_fail_audit();
select set_config('request.jwt.claims','{"sub":"60000000-0000-4000-8000-000000000002","session_id":"61000000-0000-4000-8000-000000000002"}',true);
set local role authenticated;
select throws_ok($$select public.portal_save_booking('64000000-0000-4000-8000-000000000004',(select command||'{"version":2,"adults":3}'::jsonb from cinema_commands where kind='booking'))$$,'P0001','Synthetic audit failure','Audit failure rolls back RPC');
select is((select adults from public.experience_bookings where id='63000000-0000-4000-8000-000000000001'),8,'Business quantity preserved after audit failure');
reset role;
select is((select count(*) from private.mutation_requests where request_id='64000000-0000-4000-8000-000000000004'),0::bigint,'Failed command leaves no idempotency receipt');
drop trigger phase6_fail_audit on public.audit_events;
select set_config('request.jwt.claims','{}',true);
update public.portal_profiles set active=false where id='60000000-0000-4000-8000-000000000002';
select set_config('request.jwt.claims','{"sub":"60000000-0000-4000-8000-000000000002","session_id":"61000000-0000-4000-8000-000000000002"}',true);
set local role authenticated;
select throws_ok($$select public.portal_save_booking(gen_random_uuid(),(select command||'{"version":2}'::jsonb from cinema_commands where kind='booking'))$$,'P0001','E_FORBIDDEN','Inactive profile cannot mutate');
reset role;
select set_config('request.jwt.claims','{}',true);
update public.portal_profiles set active=true where id='60000000-0000-4000-8000-000000000002';
delete from auth.sessions where user_id='60000000-0000-4000-8000-000000000002';
select set_config('request.jwt.claims','{"sub":"60000000-0000-4000-8000-000000000002","session_id":"61000000-0000-4000-8000-000000000002"}',true);
set local role authenticated;
select throws_ok($$select public.portal_save_booking(gen_random_uuid(),(select command||'{"version":2}'::jsonb from cinema_commands where kind='booking'))$$,'P0001','E_FORBIDDEN','Revoked session cannot mutate');
reset role;
select * from finish();
rollback;
