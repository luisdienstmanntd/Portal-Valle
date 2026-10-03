# Progresso — Portal Valle

Current phase: Phase 6 adaptada — Cine Toscana como primeiro fluxo operacional.

Status: PHASE_6_IN_VALIDATION. Baseline Fase5 aprovada CI37151730319, fechamento614b733; Fase6 ainda não concluída.

Completed: Fases 0–5; Fase5 validada em CI: modelo das quatro tabelas, domínio puro/mapping, capacidade por unidade/limite físico, RLS e auditoria atômica. Sem UI/RPC de escrita operacional.

In progress: Cine autorizado expressamente; Lora adiada. UI sessão/inscrição, adultos somente, 8pessoas/4puffs, RPCs atômicas, locks/idempotência/versões/presença/auditoria. Prévia preservada porta3100. Ver CINEMA_OPERATIONS. Testes desta etapa em andamento.

Next step: concluir verificações/revisão/documentação. Não promover Fase6 antes do CI; Lora não implementada.

Blocked by: hosted adiado por quota conforme escolha do proprietário. Não alterar legados, projetos existentes ou plano.

Last verified implementation commit: 3803dd111e0e7a5f7da1e87d1b07e6abea5f182e, CI37151730319 PASS.

Tests status: lint/TS/67 unit/build PASS; 24 E2E preview, 113 pgTAP (50 novos), 7 HTTP, 14 Auth E2E, Auth/perfil/cadastro bloqueado checkpoints, advisors e cleanup PASS. Banco/Auth somente em CI Linux; Windows sem Docker.

Next AI instruction: concluir Fase6 adaptada Cine; ler CINEMA_OPERATIONS. Cine exclusivo adultos8pessoas/4puffs; puffs provisoriamente exclusivos ceil(adults/2), suposição comunicada. Lora/no_show sem padrão operacional. Preservar prévia/isolamento/hospedagem adiada.
