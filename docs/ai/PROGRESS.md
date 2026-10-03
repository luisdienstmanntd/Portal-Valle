# Progresso — Portal Valle

Current phase: Fase 8 — La Vera Pizza; Lora permanece adiada.
Status: IMPLEMENTED_PENDING_CI_AND_REVIEW.
Completed: Fases 0–5 e Fase 6 adaptada Cine. Filme/local/unidades da Fase 7 já cobertos pelo Cine.
In progress: Pizza reutiliza o módulo de experiências; 12 vagas por adultos; crianças somente nas observações, regra corrigida também no Cine. Lora terá capacidade inicial 12, ainda não implementada.
Next step: validar CI isolado, obter APROVADO TECNICAMENTE e registrar fechamento.
Blocked by: Supabase hospedado adiado por quota; nenhuma alteração aos legados.
Last verified implementation commit: db28d2b85aee20d6859b4fb87e6b2e6ddc47ab67 (Fase 6, CI37155203841 PASS); fechamento c1a0fe1.
Tests: Fase 8 check/build locais PASS, 85 unit e 32 E2E de prévia PASS. SQL/HTTP/Auth aguardam CI Linux; Docker ausente no Windows.
Preview: porta 3100, build .next, PID em work/phase8-preview.pid; não sobrescrever build ativo. Sem ENV, formulários desabilitados.
Next AI instruction: ler PIZZA_OPERATIONS e PHASE_8_REPORT. Cine 8 adultos/4 puffs exclusivos ceil(adults/2); Pizza 12 adultos; Lora 12 adultos planejada. Crianças nas observações com idade. Concluir somente esta fase; preservar isolamento/hosted adiado.
