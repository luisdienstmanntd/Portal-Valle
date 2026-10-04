# Fase 9 — Programação semanal

## Objetivo

Visual semanal, criar/editar/cancelar sessões e duplicar semana sem copiar reservas.

## Implementado

Projeção de occurrences reais do Cine/Pizza, segunda-domingo no fuso America/Sao_Paulo. Seleção/navegação semanal; criação/edição/cancelamento reaproveitam os fluxos existentes e revalidam a programação. Duplicação somente para destino vazio, novas sessões em rascunho com IDs próprios, version1 e responsável atual; sem inscrições/presença. Faixa1900–2099 e máximo100sessões.

## Arquivos criados/alterados

weekly-program/domain/ui, programacao/page/actions, experiences/queries/actions, CSS, tipos RPC, migrations20261004011842/20261004013531, SQL/HTTP/unit/E2E, docs e ignores dos builds de verificação.

## Banco

RPC com weekly_program.manage e permissão viva; resultado do lote em tabela privada com RLS/grants fechados. Advisory comum serializa writers de occurrence e duplicações antes de catálogo/linhas. Horários locais preservados na mudança de offset, gaps rejeitados. Receipts/cópias/auditoria atômicos. Fonte draft/published, Cine/Pizza ativos; destino inclusive cancelados bloqueia. Nenhuma tabela duplicada de programação nem alteração a legados/hospedado.

## Testes executados

Check (lint/TS/89 unit), build e36prévia E2E locais nos4viewports;4testes focalizados após bounds. Capturas desktop/mobile inspecionadas e prévia3100 atualizada. Banco/Auth/HTTP em CI Linux efêmero.

## Resultado dos testes

CI37168649494/509542335c787ad4dde34635aa1b9290d1431dd9 PASS: 89 unit, 36 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints de duplicação concorrente/criação manual/idempotência/sem inscrições, Cine/Pizza, advisors e cleanup PASS.
AuthUI comprova criação, projeção Cine/Pizza, duplicação, cópia sem reservas, edição e cancelamento refletidos na semana. CI inicial37168251847 teve196pgTAP/7HTTP/checkpoints PASS e Auth13/14 por locator encontrando títulos repetidos antes do redirect. Corrigido para heading level1, mantendo assertions; nova execução14/14PASS. APROVADO TECNICAMENTE pelo revisor independente.

## Riscos encontrados

Hosted/quota, contas reais, retenção e tablets físicos pendentes. Fonte acima100 falha sem semana truncada; destino inclusive cancelados bloqueia. SQL administrativo privilegiado não é writer operacional suportado.

## Pendências

Sem bloqueio técnico da Fase9. Lora segue adiada; hosted, retenção e contas reais pendentes. Agenda diária pertence à Fase10.

## Commit

Implementação994642e62582d2fd52fd10ab9e494d577d03985f e correção509542335c787ad4dde34635aa1b9290d1431dd9 publicados. Fechamento documental posterior.

## Próxima fase

Fase10 Agenda diária, avanço automático autorizado pelo proprietário.

## Validação manual sugerida

Abrir /programacao, escolher semana/avançar/voltar; com Auth de teste criar/editar/cancelar pelas sessões e verificar a semana. Duplicar para destino vazio, conferir rascunhos e ausência de inscrições/presença antes de publicar cada sessão. Na prévia sem ENV, conexão pendente e duplicação desabilitada são esperadas.
