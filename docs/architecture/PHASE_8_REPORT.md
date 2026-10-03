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
Check (lint/TS/85 unit), build e 32 E2E de prévia locais. Capturas desktop/mobile inspecionadas. SQL/HTTP/Auth aguardam CI Linux isolado.
## Resultado dos testes
Local PASS; CI e revisão final pendentes.
## Riscos encontrados
Hosted adiado por quota, tablets físicos/retencão/contas reais pendentes; distribuição exclusiva de puffs provisória, no_show não definido.
## Pendências
Concluir CI e aprovação técnica; Lora adiada.
## Commit
A registrar após revisão e publicação autorizada.
## Próxima fase
Fase 9 Programação semanal, após conclusão e autorização conforme instruções vigentes.
## Validação manual sugerida
Abrir /experiencias/la-vera-pizza e Cine; confirmar 12 adultos Pizza/8 adultos e4puffs Cine, regra CHD nas observações e formulários desabilitados sem ENV.

AGUARDANDO VALIDAÇÃO CI E REVISÃO DA FASE ATUAL.
