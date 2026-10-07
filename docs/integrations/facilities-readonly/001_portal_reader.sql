-- PROPOSTA para o banco do sistema Facilities (Piscina/Academia). NÃO aplicada.
-- Aplicar somente com autorização do proprietário, no ambiente de teste primeiro, como dono (postgres).
-- Entrega ao Portal: 4 colunas, somente leitura, sem apartamento, nome, telefone, notas, tokens ou flags.
create schema if not exists portal_readonly;
revoke all on schema portal_readonly from public;

-- View do dono: lê reservations ignorando RLS apenas nesta projeção (RLS e grants da tabela ficam intactos).
-- Janela limitada (current_date segue o fuso do servidor; basta como limite de exposição, o Portal filtra o dia civil).
create or replace view portal_readonly.facility_reservations with (security_barrier = true) as
 select id, facility, reservation_date, slot_start
 from public.reservations
 where facility in ('pool', 'gym')
   and reservation_date between current_date - 31 and current_date + 366;
revoke all on portal_readonly.facility_reservations from public;

do $$ begin
 if not exists (select 1 from pg_roles where rolname = 'portal_reader') then
  create role portal_reader nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls connection limit 3;
 end if;
end $$;
alter role portal_reader set default_transaction_read_only = 'on';
alter role portal_reader set statement_timeout = '3s';
alter role portal_reader set idle_in_transaction_session_timeout = '5s';
grant usage on schema portal_readonly to portal_reader;
grant select on portal_readonly.facility_reservations to portal_reader;
-- Login e senha NÃO ficam neste arquivo: o dono executa fora do repositório
--   alter role portal_reader login password '<senha gerada>';
-- e entrega a credencial somente ao ENV de servidor do Portal.
