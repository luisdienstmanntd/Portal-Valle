# Progresso — Portal Valle

Current phase: Fase12 — Osteria, preparação em validação; integração operacional pendente.
Status: preparação Fase11 aprovada; Fase12 implementada, CI/revisão final pendentes; conexões externas operacionais pendentes.
Completed: Fases 0–5; Cine Fase6 adaptada com requisitos7; Pizza Fase8; Programação semanal Fase9; Agenda diária Fase10.
In progress: fechar preparação Fase12 com CI/revisão. Factories externos continuam null.
Tests: Fase12 local check/build/112 unitários e48 prévias E2E PASS; CI pendente. Fase11 CI37170970533 PASS.
Next step: validar CI/revisão Fase12; depois Home Hoje com estados de fontes, preservando gates. Avanço automático já autorizado.
Blocked by: hospedado adiado por quota; Docker ausente neste Windows. Nenhuma alteração aos legados.
Last verified implementation commit: 0630c5374590375e91059f40691f5082e4df9ca9, CI37170970533 PASS.
Preview: porta3100, build .next; PID em work/phase11-preview-final.pid. Telas Facilities atualizadas. Não sobrescrever build ativo; usar diretório alternativo para builds futuros.
Next AI instruction: ler OSTERIA_OPERATIONS/PHASE_12_REPORT e FACILITIES_OPERATIONS; não habilitar factory sem acesso restrito comprovado. Timeline inicial somente sessões Cine/Pizza, sem hóspedes/contagem. Unknown não equivale a empty. Datas1900–2099 America/Sao_Paulo. Facilities/Osteria permanecem em preparação e exigem gates das auditorias. Lora adiada12adultos; Cine8adultos/4puffs; Pizza12adultos; crianças nas observações.

Fase10: CI37170139071/c639381de43eb842e955f54242965817794f68b2 PASS: 97 unitários, 40 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints Agenda/Cine/Pizza/semana, advisors e cleanup PASS. Revisão independente confirmou CI e emitiu APROVADO TECNICAMENTE para Fase10. Fase11 iniciada pela auditoria de acesso somente leitura: snapshot Facilities main permanece eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0. Consulta aceita de metadados confirmou grants de escrita para postgres/service_role, sem SELECT-only identificado. Verificação adicional RLS/views foi recusada pela revisão automática por falta de autorização específica para hospedado nesta fase; pergunta então pendente, autorizada pelo proprietário no turno seguinte. Sem reservas/hóspedes lidos, sem alterações externas ou adapter habilitado.

Fase11: proprietário autorizou consulta adicional de metadados; executada com êxito, RLS=true/policies=[]/views=[] para Facilities. Bloqueio de autorização anterior resolvido; acesso SELECT-only continua não comprovado. Adapter/contratos/telas preparados, produção desconectada. 103 unitários/check/build e44 prévias PASS; CI37170970533 PASS, APROVADO TECNICAMENTE (preparação). Prévia3100 final .next, PID work/phase11-preview-final.pid; não sobrescrever build ativo. Ver PHASE_11_REPORT/FACILITIES_OPERATIONS.
