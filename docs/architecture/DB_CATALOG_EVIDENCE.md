# Catálogos dos bancos existentes — leitura em 2026-10-01

Consulta feita pelo conector Supabase ao catálogo (`information_schema`, `pg_catalog`/`pg_policies`) de dois projetos da conta, em `BEGIN READ ONLY ... COMMIT`. Nenhuma linha de hóspede, reserva, mensagem ou outro dado operacional foi consultada. Nenhuma migration, policy, grant ou dado foi alterado. Nome/ref de projeto são identificadores, não credenciais.

## Facilities — projeto candidato `valle-dincanto-piscina`

Ref `fjwqnoojvtdiytedtfwt`, PostgreSQL 17.6 (metadado do projeto). `public.reservations` e `public.active_stays` existem e têm RLS habilitada, sem policies. Catálogo de privilégios para `anon`, `authenticated`, `service_role` mostrou grants somente para `service_role`, inclusive SELECT e operações de escrita. Isso confirma que usar essa credencial não satisfaria acesso read-only. O schema coincide com as migrations do código; o URL efetivo configurado no deploy não foi lido, portanto a associação do deploy a este projeto ainda precisa de verificação.

`reservations` possui id, reservation_date DATE, slot_start TIME, apartment_number, facility, created_by, notas e campos opcionais de nome/WhatsApp; `active_stays` inclui token, apartamento e checkout_date. Não consultar nem transportar token para Portal. API de migrations deste projeto retornou lista vazia; isso **não** prova ausência de migrations aplicadas por outros caminhos, dado que o repositório contém sete SQL versionados.

## Osteria — projeto confirmado pelo código

Ref `fiamtckdglzdrynmrlpj`, PostgreSQL 17.6 (metadado do projeto), URL presente em `js/core/supabaseClient.js` do commit auditado. O catálogo contém oito tabelas públicas: `config_dia`, `config_sistema`, `heartbeat`, `hospedes`, `mesas`, `notificacoes`, `reservas`, `reservas_log`; todas com RLS habilitada.

Em `reservas`, `hospedes` e outras tabelas operacionais, a política é `FOR ALL`, com `auth.uid() IS NOT NULL` em USING/WITH CHECK. Uma sessão comum autenticada tem caminho de escrita, logo não é identidade de integração limitada a SELECT. `heartbeat` é exceção de manutenção, com SELECT/INSERT/DELETE para anon/authenticated.

`reservas` tem data DATE, horario TIME, paxs e chd inteiros, mesa_identificador textual, hospede_id opcional, `bloqueado`, `somente_hospedes`, `cancelado_em`, `inicio_mesa`, `fim_mesa`, `origem_dados`, `confiavel_para_tempo` e `status_recepcao`. Este último tem CHECK `aguardando|chegou|no_show`; não aparece no snapshot Git anterior. A API de migrations remotas retornou apenas `20260929234853_status_recepcao`, enquanto o repositório auditado possui 15 migrations anteriores. Isso indica diferença de histórico rastreado, não autoriza reexecutar migrations.

Existem quatro views públicas: `vw_reservas_detalhado`, `vw_reservas_por_dia`, `vw_reservas_por_dia_semana`, `vw_reservas_tempo_real`. O catálogo retornou `reloptions=null` para todas, ou seja, sem `security_invoker=true` explícito. Views detalhadas incluem telefone e observações; o DTO da agenda deve minimizá-los. A expressão atual de `eh_reserva_real` exige hóspede associado, ausência de bloqueio, ausência de bloqueio só hóspedes e cancelado_em nulo. A view de totais diários separa total_reservas, total_pax e bloqueios. `vw_reservas_tempo_real` filtra por `confiavel_para_tempo` e reserva real; não é garantia de que liste todos os eventos operacionais do dia.

## Limite de validade

Essas consultas descrevem os catálogos no momento da leitura, não uma interface estável ou permissão futura. Não foi testada a UI em produção, a configuração de runtime Vercel/Firebase ou uma conta SELECT-only. Antes de implementar adapters, revisar catálogo vigente, código/deploy da fonte, política de proteção de PII e contrato de autenticação em ambiente apropriado.

