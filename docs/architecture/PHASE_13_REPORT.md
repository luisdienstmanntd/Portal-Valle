# Fase13 — Home Hoje

## Objetivo
Reunir experiências e contratos preparados de Piscina/Academia/Osteria, com estados independentes e timeline útil à recepção.

## Implementado
Composição paralela dos leitores; quatro cards de fonte; timeline ordenada; próxima atividade consultada; data/dia da semana do hotel; atualização e visão parcial explícita. Sem zero desconhecido. Guard por domínio antes da carga.

## Arquivos criados
src/modules/home/application/read-home-day.ts e teste, carregador server-only, componente Home, E2E de prévia, HOME_TODAY_OPERATIONS e este relatório.

## Arquivos alterados
Página Hoje, CSS responsivo, E2E Auth, README e memória docs/ai.

## Banco
Nenhuma migration/recurso/credencial/conexão externa criada. Factories null; hospedagem própria adiada por quota. Nenhuma alteração aos legados.

## Testes executados
Check local (lint/typecheck/118 unitários), build e52 prévias E2E PASS. Banco/Auth/HTTP executados somente em CI Linux isolado, sem alegar execução local.

## Resultado dos testes
CI37483659784 no SHA68cfb5380efc29e5cd72e688e9ed675ee0a7a60a PASS:118 unitários,52 prévias E2E,198 pgTAP,7 HTTP,14 Auth E2E. Checkpoints Auth/RLS/Cine/Pizza/semana/agenda, advisors e cleanup PASS. Revisor independente confirmou diretamente e emitiu APROVADO TECNICAMENTE em2026-10-06.

## Riscos encontrados
Home operacional depende de fontes conectadas com acesso restrito; hoje mostra preparação. Não oferece ocupação de experiências/PII externa, conforme contratos mínimos atuais. Ferramentas dev trazem alerta de DoS em braces por padrão aninhado; audit produção sem achados. Sem versão corrigida publicada em npm em2026-10-06; não aplicar downgrade forçado Next/ESLint.

## Pendências
SELECT-only Facilities/Osteria, provisionamento independente Portal/Auth/backup, retenção e tablet físico. PR1 permanece em rascunho, sem merge/deploy. Revisão e CI da implementação concluídos.

## Commit
Implementação:68cfb5380efc29e5cd72e688e9ed675ee0a7a60a, branch codex/home-today-phase13, PR1 em rascunho.

## Próxima fase
Fase14 Resiliência, sem iniciar nesta entrega. Preservar gates dos legados e Lora adiada.

## Validação manual sugerida
Abrir Hoje: conferir data/dia da semana, quatro fontes pendentes sem zero e visão parcial. Atualizar dia; navegar aos detalhes. Em teste autenticado, sessões Cine/Pizza aparecem independentemente das fontes externas pendentes.

2026-10-06 — Fase13 verificação local: lint/typecheck/118unit/build PASS. Primeira prévia50/52; duas navegações existentes Cine/Academia tablet-landscape ficaram na página anterior. Repetição focal3x:6/6 PASS; suíte completa repetida52/52 PASS, sem alterar assertions nem produto. Causa transitória não reproduzida; CI Linux52/52PASS confirmou suíte. Layout Home inspecionado nos quatro viewports, sem overflow.
