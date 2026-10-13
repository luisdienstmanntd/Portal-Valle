# Progresso — Portal Valle

Current phase: Fase15 — Visão Estadia concluída.
Status: Fase15 APROVADO TECNICAMENTE; CI PASS. Conexões externas operacionais pendentes.
Completed: Fases0–5; Cine6 com requisitos7; Pizza8; programação9; agenda10; preparação11/12; Home13; resiliência14; Visão Estadia15.
In progress: nenhuma implementação; Fase16 não iniciada. Factories externos continuam null.
Tests: CI38435133727/75c55f0 PASS:130unit,56prévia,22resiliência,198pgTAP,7HTTP,14Auth; advisors/checkpoints/cleanup PASS. Local check/build/22resiliência/56prévia (52+4) PASS.
Next step: Fase16 Relatórios somente com dados confiáveis e nova autorização explícita.
Blocked by: hospedado adiado por quota; Docker ausente neste Windows. Nenhuma alteração aos legados.
Last verified implementation commit: 75c55f090244753d259d577dd3ff7bdf67a68147, CI38435133727 PASS; PR1 em rascunho, não mesclado.
Preview: Fase15 em127.0.0.1:3118/estadias, sessão19375 usa .next-resilience semENV/dadosreais. Não sobrescrever enquanto ativo; encerrar esse servidor antes de test:resilience futuro. Prévia antiga3100 usa .next.
Next AI instruction: ler STAY_VIEW_OPERATIONS/PHASE_15_REPORT, RESILIENCE_OPERATIONS/PHASE_14_REPORT e HOME_TODAY_OPERATIONS/PHASE_13_REPORT, OSTERIA_OPERATIONS e FACILITIES_OPERATIONS; não habilitar factory sem acesso restrito comprovado. Agenda continua somente sessões Cine/Pizza; Home compõe quatro contratos mínimos, sem identidade de hóspede. Unknown não equivale a empty. Datas1900–2099 America/Sao_Paulo. Facilities/Osteria permanecem em preparação e exigem gates das auditorias. Lora adiada12adultos; Cine8adultos/4puffs; Pizza12adultos; crianças nas observações.

Fase10: CI37170139071/c639381de43eb842e955f54242965817794f68b2 PASS: 97 unitários, 40 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints Agenda/Cine/Pizza/semana, advisors e cleanup PASS. Revisão independente confirmou CI e emitiu APROVADO TECNICAMENTE para Fase10. Fase11 iniciada pela auditoria de acesso somente leitura: snapshot Facilities main permanece eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0. Consulta aceita de metadados confirmou grants de escrita para postgres/service_role, sem SELECT-only identificado. Verificação adicional RLS/views foi recusada pela revisão automática por falta de autorização específica para hospedado nesta fase; pergunta então pendente, autorizada pelo proprietário no turno seguinte. Sem reservas/hóspedes lidos, sem alterações externas ou adapter habilitado.

Fase11: proprietário autorizou consulta adicional de metadados; executada com êxito, RLS=true/policies=[]/views=[] para Facilities. Bloqueio de autorização anterior resolvido; acesso SELECT-only continua não comprovado. Adapter/contratos/telas preparados, produção desconectada. 103 unitários/check/build e44 prévias PASS; CI37170970533 PASS, APROVADO TECNICAMENTE (preparação). Prévia3100 final .next, PID work/phase11-preview-final.pid; não sobrescrever build ativo. Ver PHASE_11_REPORT/FACILITIES_OPERATIONS.
