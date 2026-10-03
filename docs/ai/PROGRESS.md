# Progresso — Portal Valle

Current phase: Phase 3 — Supabase Portal, autorizada pelo proprietário em 2026-10-02.

Status: PHASE_3_VALIDATING. Implementação liberada pelo revisor para commit/push de validação; fechamento exige CI de banco e APROVADO TECNICAMENTE.

Completed: Fases 0–2 verificadas/publicadas. Fase 3 local: migration mínima, RLS/grants, clientes browser/server de leitura, ENV com isolamento, 16 unit, testes SQL/HTTP e CI isolado preparados.

In progress: PostgreSQL real no CI e revisão final. Prévia do proprietário preservada em http://127.0.0.1:3100/hoje; build de verificação separado em .next-check.

Next step: publicar para executar CI database/checks/e2e, corrigir falhas e obter revisão final. Ao concluir, PARAR e solicitar autorização separada para Fase 4.

Blocked by: Supabase hospedado recusado por quota de dois free; proprietário escolheu validar em CI e adiar hospedagem. Não pausar/excluir/alterar bancos existentes nem contratar plano pago. Integrações externas exigem SELECT-only comprovável nas Fases 11/12.

Last verified implementation commit: Fase 2 d34ed631299425636814ae38a7f0f9965d966b94; fechamento f85433e61f49872bbe40bd9cc4a180822d3ab9ed. Novo commit será registrado após CI.

Tests status Phase 3: npm run check PASS (lint/TS/16 unit); build isolado PASS; 20 E2E contra build atual na porta 3102 PASS. pgTAP/HTTP pendentes CI; Docker ausente neste Windows.

Next AI instruction: atuar apenas na Fase 3 até fechar revisão/testes/documentação. Consultar PHASE_3_REPORT e SUPABASE_SETUP. Banco hosted explicitamente adiado; não afirmar provisionamento ou backup. Nenhuma Auth operacional ou experiência completa nesta fase. Preservar prévia e legados.
