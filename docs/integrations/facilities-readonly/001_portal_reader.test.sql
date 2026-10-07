-- Teste executável com psql -v ON_ERROR_STOP=1 em banco DESCARTÁVEL. Schema legado reconstruído de FACILITIES_AUDIT.md; dados fictícios.
create table public.reservations(id uuid primary key default gen_random_uuid(), facility text not null default 'pool' check (facility in ('pool','gym')),
 reservation_date date not null, slot_start time not null, apartment_number text not null, guest_name text, guest_whatsapp text, notes text,
 created_by text not null default 'guest');
create table public.active_stays(id uuid primary key default gen_random_uuid(), token text not null unique, apartment_number text not null, checkout_date date not null);
alter table public.reservations enable row level security; alter table public.active_stays enable row level security;
revoke all on public.reservations, public.active_stays from public;
insert into public.reservations(facility,reservation_date,slot_start,apartment_number,guest_name,guest_whatsapp,notes) values
 ('pool', current_date, '14:00', 'TEST-1', 'Fictício', '000', 'nota'),
 ('gym', current_date + 1, '07:00', 'TEST-2', null, null, null),
 ('pool', current_date - 400, '14:00', 'TEST-3', null, null, null),
 ('pool', current_date + 400, '14:00', 'TEST-4', null, null, null);
insert into public.active_stays(token, apartment_number, checkout_date) values ('tok-fake', 'TEST-1', current_date);
\i docs/integrations/facilities-readonly/001_portal_reader.sql
\i docs/integrations/facilities-readonly/001_portal_reader.sql
set role portal_reader;
do $$ declare n int; cols text; denied boolean; begin
 select count(*) into n from portal_readonly.facility_reservations;
 assert n = 2, 'janela deve expor só 2 linhas, achou ' || n;
 select string_agg(attname, ',' order by attnum) into cols from pg_attribute where attrelid = 'portal_readonly.facility_reservations'::regclass and attnum > 0;
 assert cols = 'id,facility,reservation_date,slot_start', 'colunas inesperadas: ' || cols;
 foreach cols in array array['select * from public.reservations','select * from public.active_stays',
  'insert into portal_readonly.facility_reservations(id) values (gen_random_uuid())','update portal_readonly.facility_reservations set facility=''gym''',
  'delete from portal_readonly.facility_reservations','create table public.x(a int)','create table portal_readonly.x(a int)','truncate public.reservations'] loop
  denied := false;
  begin execute cols; exception when insufficient_privilege or read_only_sql_transaction or feature_not_supported then denied := true; end;
  assert denied, 'deveria negar: ' || cols;
 end loop;
end $$;
reset role;
do $$ begin
 assert (select rolconfig @> array['default_transaction_read_only=on','statement_timeout=3s'] from pg_roles where rolname='portal_reader'), 'limites do papel ausentes';
 assert (select not rolcanlogin and not rolsuper and not rolbypassrls and not rolcreaterole and not rolcreatedb and rolconnlimit = 3 from pg_roles where rolname='portal_reader'), 'papel deve nascer sem login e sem privilégios';
 assert not has_table_privilege('portal_reader','public.reservations','select'), 'sem acesso direto à tabela';
end $$;
\i docs/integrations/facilities-readonly/001_portal_reader_rollback.sql
do $$ begin assert not exists(select 1 from pg_roles where rolname='portal_reader') and not exists(select 1 from pg_namespace where nspname='portal_readonly'), 'rollback incompleto'; end $$;
\echo TODOS OS TESTES PASSARAM
