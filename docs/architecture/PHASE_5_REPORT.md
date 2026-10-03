# Fase 5 — Modelo experience

Status: concluída, CI completo PASS e APROVADO TECNICAMENTE pelo revisor independente. Autorizada automaticamente pelo proprietário após conclusão técnica da Fase4.

## Objetivo

Criar experiences, experience_occurrences, experience_bookings, audit_events, domínio e testes, sem UI completa.

## Implementado

Modelos separados, validação pura, projeção de capacidade por pessoas/reservas/unidades/ilimitado e limite físico adicional; mapper de linhas completas do banco; RLS com sessão viva; auditoria na mesma transação com payload mínimo. Cine preserva 8 pessoas/4 puffs de casal. Regra Lora adiada pelo proprietário, sem presumir crianças/no_show. Sem RPC de escrita, integração externa ou dados reais.

## Arquivos criados

Migration 20261003024909_portal_experiences.sql; portal_experiences.test.sql; src/modules/experiences/domain/model.ts, capacity.ts, model.test.ts; infrastructure/mapping.ts, mapping.test.ts; EXPERIENCE_MODEL.md e este relatório.

## Arquivos alterados

database.types.ts, integração HTTP, README, SUPABASE_SETUP e documentos de continuidade (ARCHITECTURE, DECISIONS, PROGRESS, CHANGELOG_AI, KNOWN_ISSUES, TEST_MATRIX). Sem alterações de UI ou dos sistemas legados.

## Banco

Quatro tabelas Portal próprias com constraints/FKs/índices e RLS. Leitura de experiências exige experiences.read, auditoria settings.manage, ambas com perfil ativo/sessão viva. Nenhuma DML client concedida. Triggers privados registram actor/before/after e falha de auditoria desfaz mutação. Sem nome, telefone, apartamento, notas ou texto livre no payload. Stays, guest booking e operações concorrentes permanecem para suas fases. Hosted adiado por quota; banco efêmero apenas CI.

## Testes executados

Check local (lint/TS/67 unit), build isolado .next-check. CI37151730319: checks, e2e e database; reset das 3 migrations, pgTAP, HTTP, Auth, advisors e encerramento do stack. Prévia existente HTTP200 em /login.

## Resultado dos testes

Todos PASS: 67 unit, build, 24 E2E preview, 113 pgTAP (50 novos), 7 HTTP, 14 Auth E2E, checkpoints Auth/perfil/cadastro público bloqueado, advisors e cleanup. Rollback de reserva após falha de auditoria comprovado no SQL. Banco/Auth não executados neste Windows sem Docker. Revisor conferiu CI independentemente, revisou o mapper e aprovou tecnicamente o fechamento.

## Riscos encontrados

Sem hosted/contas reais ou comprovação de backup SaaS. Tipos continuam contrato manual. Cálculo do domínio não substitui lock/idempotência SQL: nenhuma escrita client liberada. RPC futura deve exigir identidade/permissão antes de mutar; actor null no trigger é apenas contexto de SQL administrativo, não autorização anônima.

## Pendências

Sem pendências técnicas da Fase5. Antes de operação: regras Lora/crianças/no_show, alocação Cine por puff/grupo, retenção, hospedagem/backup e mutações atômicas das fases seguintes. Não ativar dados reais ou guest booking nesta entrega.

## Commit

Implementação validada: 3803dd111e0e7a5f7da1e87d1b07e6abea5f182e.
CI: https://github.com/luisdienstmanntd/Portal-Valle/actions/runs/37151730319

## Próxima fase

Fase6 depende de nova autorização; Lora foi adiada pelo proprietário. A autorização automática recebida cobriu esta Fase5.

## Validação manual sugerida

Prévia preservada em http://127.0.0.1:3100/login. Nenhuma mudança visual nesta fase de modelo; login fica desabilitado sem ENV/contas reais. Consultar EXPERIENCE_MODEL e logs do CI para validação SQL/domínio. Não usar bancos legados como destino de teste.

AGUARDANDO AUTORIZAÇÃO PARA INICIAR A PRÓXIMA FASE.
