# Progresso — Portal Valle

Current phase: Fase15 operacional: cadastro próprio e vínculos explícitos.
Status: Conceito15 APROVADO TECNICAMENTE; CI37529212227 PASS. Implementação operacional iniciada.
Completed: Fases0–5; Cine6/7; Pizza8; Programação9; Agenda10; preparações11/12 (operacionais pendentes); Home13; Resiliência14; aviso programação09–12/10.
In progress: persistência e cadastro de estadias; depois vínculo explícito das reservas.
Tests: conceito15 CI37529212227/f6e5f5cac43ed7c8beaa5cdf78ad494ee201a256 PASS:142unit/56prévia/198pgTAP/7HTTP/14Auth/build/advisors/cleanup.
Next step: fechar conceito15; operação cadastro/vínculos exige persistência própria auditada antes de Fase16. Avanço automático autorizado.
Blocked by: hospedado adiado por quota; Docker ausente neste Windows. Nenhuma alteração aos legados.
Last verified implementation commit:f6e5f5cac43ed7c8beaa5cdf78ad494ee201a256, CI37529212227 PASS.
Preview: porta3100, build .next-verify; PID em work/phase15-preview.pid. Menu Estadias e programação09–12/10 preservada. Não sobrescrever build ativo; usar diretório alternativo para builds futuros.
Next AI instruction: ler OSTERIA_OPERATIONS/PHASE_12_REPORT e FACILITIES_OPERATIONS; não habilitar factory sem acesso restrito comprovado. Home agrega sessões Cine/Pizza e contratos externos preparados; fontes desconectadas sem contagens. Unknown não equivale a empty. Datas1900–2099 America/Sao_Paulo. Facilities/Osteria permanecem em preparação e exigem gates das auditorias. Lora adiada12adultos; Cine8adultos/4puffs; Pizza12adultos; crianças nas observações.

Fase10: CI37170139071/c639381de43eb842e955f54242965817794f68b2 PASS: 97 unitários, 40 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints Agenda/Cine/Pizza/semana, advisors e cleanup PASS. Revisão independente confirmou CI e emitiu APROVADO TECNICAMENTE para Fase10. Fase11 iniciada pela auditoria de acesso somente leitura: snapshot Facilities main permanece eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0. Consulta aceita de metadados confirmou grants de escrita para postgres/service_role, sem SELECT-only identificado. Verificação adicional RLS/views foi recusada pela revisão automática por falta de autorização específica para hospedado nesta fase; pergunta então pendente, autorizada pelo proprietário no turno seguinte. Sem reservas/hóspedes lidos, sem alterações externas ou adapter habilitado.

Fase11: proprietário autorizou consulta adicional de metadados; executada com êxito, RLS=true/policies=[]/views=[] para Facilities. Bloqueio de autorização anterior resolvido; acesso SELECT-only continua não comprovado. Adapter/contratos/telas preparados, produção desconectada. 103 unitários/check/build e44 prévias PASS; CI37170970533 PASS, APROVADO TECNICAMENTE (preparação). Prévia3100 final .next, PID work/phase11-preview-final.pid; não sobrescrever build ativo. Ver PHASE_11_REPORT/FACILITIES_OPERATIONS.

Fase13 locais:117 unitários/check/build e52 prévias E2E PASS. Servidor temporário3102 precisou encerramento manual após cenários; comando E2E concluiu exit0. CI/revisão final pendentes.

Resultado Fase13: CI37524673713/49a47225c1db66856ba5ab3ddfd763e57fb51bd9 PASS:117unit/52prévia/198pgTAP/7HTTP/14Auth; advisors/checkpoints/cleanup PASS. Conexões externas seguem pendentes.

2026-10-06 — Fase14: matriz resiliência9falhas (offline/timeout/schema x Portal/Facilities/Osteria), paralelo, recuperação e resposta tardia. ENV ausente/parcial/chave administrativa testados.132unit/check locais PASS; CI/revisão pendentes. Somente testes/docs, sem falhas induzidas em bancos reais, runtime inalterado.

Resultado Fase14: CI37525732273/aa5438f750c742786064b3e6cf4f40c291e3686a PASS:132unit/52prévia/198pgTAP/7HTTP/14Auth; build/advisors/checkpoints/cleanup PASS. Revisão final em fechamento.

2026-10-06 — Solicitação do proprietário: programação do log no início de Hoje. Informativo Bem-estar09–12/10/2026 confirmado (sexta a segunda), transcrição sem PII, dias expansíveis. Substitui welcome banner; não altera reservas/capacidades nem conecta log. Inserção manual em código; editor recorrente pendente. Check132/build PASS; validação final E2E/CI/revisão em andamento.

Resultado aviso programação: CI37527250539/a36c41b572c184be4d2ee7c7af47109bd952e5a8 PASS:132unit/52prévia/198pgTAP/7HTTP/14Auth, build/advisors/checkpoints/cleanup PASS. Conferência com imagem original pelo autor e revisor; datas09–12/10 confirmadas. Parecer final em fechamento.

2026-10-06 — Fase15 conceitual: proprietário escolheu cadastro próprio com apartamento/entrada/saída e vínculos explícitos. Modelo/GetStayAgenda validados, sem inferência por coincidência, readersprodução inexistentes, nenhum DB alterado. /estadias prepara cadastro, controles desabilitados.142/check/build PASS; E2E/CI/revisão pendentes. Operação cadastral/vínculos ainda pendente.

Conceito15 local:142unit/check/build e56 E2E PASS. CI/revisão final pendentes.

Resultado conceito15: CI37529212227/f6e5f5cac43ed7c8beaa5cdf78ad494ee201a256 PASS:142unit/56prévia/198pgTAP/7HTTP/14Auth; build/advisors/checkpoints/cleanup PASS. Revisão final em fechamento; cadastro/vínculos operacionais não habilitados.

2026-10-06: revisor confirmou APROVADO TECNICAMENTE somente ao conceito15. Proprietário autorizou desenvolvimento contínuo sem novas confirmações; dúvidas não urgentes serão documentadas. Nenhuma autorização para alterar legados foi inferida.

Cadastro15: paginação por cursor50+1 evita limite permanente; check153/build PASS. Revisão pré-CI APROVADO TECNICAMENTE após correções de paginação e Auth E2E. Cadastro e leitura próprios; vínculos pendentes.

2026-10-06 — Vínculo15: migration 20261006230000 remove check stay_id=null, adiciona FK restrict e RPC portal_link_booking_stay (idempotente, versão, auditoria com stay_id, mesmo apartamento e dia civil America/Sao_Paulo dentro do período, vincular/desvincular). Tela /estadias/[id] lista reservas vinculadas e candidatas com confirmação explícita. check156/build PASS locais; pgTAP novo (portal_booking_stay_link) NÃO executado localmente (Docker daemon ausente) — depende da CI. Revisão/CI pendentes.

Vínculo15: revisor pediu invariantes pós-vínculo; corrigido na migration 20261006233000 (triggers, desvínculo de cancelada) e stayId derivado do caminho. check local PASS; pgTAP/CI e nova revisão pendentes.

Vínculo15: revisor emitiu APROVADO TECNICAMENTE para d2ea64e (sem execução própria de pgTAP). CI do a555d5f falhou só na fixture do pgTAP novo (estadias inseridas como postgres violam o gatilho de auditoria E_FORBIDDEN); fixture agora cria estadias via portal_create_stay como operador. Aguardando CI.
