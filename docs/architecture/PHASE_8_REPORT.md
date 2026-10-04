# Fase 8 — La Vera Pizza

## Objetivo

Reutilizar Experience para Pizza, capacidade inicial 12 adultos; registrar Lora 12 sem implementá-la.
## Implementado

Sessões/inscrições/presença/observações, cancelamento e capacidade atômica. Crianças somente nas observações com idade também no Cine. UI e operações comuns por configuração explícita; sem financeiro.
## Arquivos criados/alterados

modules/experiences domain/infrastructure/ui, rotas/ações Cine/Pizza, tipos Supabase, migration 20261003220903, testes unit/SQL/HTTP/E2E e documentação AI/arquitetura.
## Banco

Catálogo Pizza 12/12, children_allowed removido, helpers privados com wrappers por categoria/slug, receipt por operação, units=0 em persons. Nenhuma sessão/hóspede real ou banco legado alterado.
## Testes executados

Check (lint/TS/85 unit), build e 32 E2E de prévia locais. Capturas desktop/mobile inspecionadas. SQL/HTTP/Auth executados no CI Linux isolado.
## Resultado dos testes

Local PASS. CI37158542094/a5fa1caf32be3599d7af5d63ea1db7a28fc647ba PASS: 85 unit, 32 prévias E2E, 169 pgTAP, 7 HTTP, 14 Auth E2E e checkpoints Cine/Pizza de concorrência, idempotência, notas CHD, versões e cancelamento; advisors e cleanup PASS. APROVADO TECNICAMENTE pelo revisor independente.
## Riscos encontrados

Hosted adiado por quota, tablets físicos/retenção/contas reais pendentes; distribuição exclusiva de puffs provisória, no_show não definido.
## Pendências

Lora, hosted, retenção e contas reais permanecem adiados; sem bloqueio técnico desta fase.
## Commit

Implementação a5fa1caf32be3599d7af5d63ea1db7a28fc647ba publicada; fechamento documental posterior.
## Próxima fase

Fase 9 Programação semanal; avanço automático autorizado pelo proprietário, mantendo revisão independente por tarefa.
## Validação manual sugerida

Abrir /experiencias/la-vera-pizza e Cine; confirmar 12 adultos Pizza/8 adultos e4puffs Cine, regra CHD nas observações e formulários desabilitados sem ENV.

FASE 8 CONCLUÍDA E APROVADA TECNICAMENTE.
