# Integrações

Estado em 2026-10-01: apenas descoberta; **ambas desabilitadas**. Evidências: `../architecture/FACILITIES_AUDIT.md`, `OSTERIA_AUDIT.md` e `DB_CATALOG_EVIDENCE.md`.

## Facilities — Piscina/Academia

- Objetivo: reservas e ocupação do dia, separadas por piscina/academia.
- Direção: Portal Next.js servidor → interface de leitura a definir → banco externo do sistema Facilities. Não há retorno de escrita nem dependência do externo no Portal.
- Banco provável na conta consultada: Supabase `valle-dincanto-piscina`, ref `fjwqnoojvtdiytedtfwt`, cujas tabelas `reservations` e `active_stays` coincidem com migrations do código. A URL exata de runtime é ENV e não foi lida; associação é forte, ainda não prova deploy.
- Formato candidato: reservation id, reservation_date, slot_start, facility, apartment_number, guest_name opcional, created_by. Não enviar token de estadia, telefone, flags WhatsApp ou notes no DTO inicial.
- Autenticação: **não resolvida**. RLS em ambas, zero policies públicas e grants apenas service_role no catálogo. É necessário contrato de leitura de privilégio mínimo antes da Fase 11.
- Riscos: chave administrativa, dados pessoais, dupla unicidade (slot e apartamento/dia), cancelamento por DELETE, data+time locais, setup/migration divergentes.
- Status: `configuration_required`; provider não faz tentativa com service_role.

## Osteria Di Lucca

- Objetivo: reservas reais do dia, pessoas e horários; mesas quando operacionalmente útil. Link externo: https://osteriadilucca.web.app/.
- Direção: Portal Next.js servidor → interface de leitura a definir → Supabase Osteria `fiamtckdglzdrynmrlpj`, confirmado no código e no catálogo. Nenhum código/runtime da Osteria importado.
- Formato candidato: id, data, horario, hospede_nome/apto com autorização, paxs, chd, mesa_identificador textual, tipo_cliente, flags de bloqueio/cancelamento. `original_base` e `posicao` não entram no domínio Portal.
- Autenticação: **não resolvida**. Políticas `FOR ALL` para `auth.uid() IS NOT NULL` dão escrita à conta operacional comum. Views existentes são amplas, com telefone/obs e sem `security_invoker` explícito no catálogo.
- Riscos: alguns fluxos de inicialização/listener fazem escrita; reservas e bloqueios compartilham tabela; views analíticas não são automaticamente contrato de agenda; schema remoto mais novo que migrations locais em ao menos `status_recepcao`.
- Status: `configuration_required`; nenhum login externo ou service role no Portal.

## Pré-requisitos das Fases 11/12

Confirmar dono do dado, referência de projeto/deploy, data source exata e versão; definir autorização para eventual view/RPC/role SELECT-only na origem; verificar grants, RLS e segurança de view. Uma mudança na origem requer tarefa e autorização específicas, migration própria do sistema externo e teste dele. Portal só deve receber credencial limitada e independente, armazenada no servidor. Sem acesso restrito comprovado, a integração fica desabilitada e a recepção usa o link do sistema de origem.

Contrato tests com fixtures fictícias: formato data/hora, mapeamento, campos nulos, bloqueio/cancelamento, 401/403, timeout, schema incompatível, fonte vazia e falha parcial. Não testar escrita contra produção para demonstrar read-only.

