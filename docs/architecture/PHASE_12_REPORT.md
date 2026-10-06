# Fase12 — Osteria: preparação de leitura

## Objetivo

Preparar adapter de reservas do dia, pessoas, horários e mesas, mantendo a operação na Osteria.

## Implementado

Contrato puro por port injetado, DTO mínimo, estados distintos e resposta completa obrigatória. Validação de data/horário civil com segundos, tipo de cliente/mesa textual, flags, cancelamento, duplicatas e limites. Bloqueios/linhas vazias excluídos, canceladas distintas e fora de totais ativos; adultos/crianças/total/roomservice somente após consulta validada. Factory null; página com guard, seleção/navegação de data, conexão pendente e Abrir Gestão da Osteria.

## Arquivos criados/alterados

modules/osteria/domain/application/infrastructure/ui e testes; osteria/page; lib/hotel-time e teste de segundos/offset histórico; E2E públicos e Auth; documentação.

## Banco

Nenhuma migration, credencial ou conexão criada. Nenhum banco/registro Osteria consultado nesta fase. Código main permanece42638d06eef9f694df4742aa29ce8c3f71d6a6e8; auditoria/meta2026-10-01 preservada como evidência datada. SELECT-only não comprovado; runtime externo não executado. Nenhuma alteração aos legados.

## Testes executados

Lint/TypeScript/112 unitários e build locais PASS.48 E2E públicos em quatro viewports PASS; CI/Auth/banco PASS. Testes de contrato usam exclusivamente fixtures fictícias.

## Resultado dos testes

CI37171940544/0306b8b278a0f07c24b7ee0c63171ae5e078b236 PASS:112 unitários,48 prévias E2E,198 pgTAP,7 HTTP e14 Auth E2E; checkpoints/advisors/cleanup PASS. APROVADO TECNICAMENTE pelo revisor para a preparação.

## Riscos encontrados

Schema/deploy podem divergir do Git; identidade operacional comum permite escrita. Nenhum acesso restrito é comprovado pela preparação. Join mínimo de tipo ausente falha contrato, sem transportar pessoas fictícias ou inferir tipo de ROOM. Limites técnicos não são capacidade do restaurante. Horário não implica presença; sem duração ou disponibilidade inventada.

## Pendências

Preparação técnica CI PASS; APROVADO TECNICAMENTE (preparação). Integração operacional Fase12 pendente de endpoint ou identidade restrita e contrato da origem verificado. Facilities também permanece desconectado. Hosted Portal adiado; Lora adiada.

## Commit

Implementação0306b8b278a0f07c24b7ee0c63171ae5e078b236 publicada e validada no CI37171940544.

## Próxima fase

Fase13 Home Hoje com estados de fontes; avanço automático autorizado. Não declarar integrações operacionais11/12 concluídas nem habilitá-las sem acesso restrito.

## Validação manual sugerida

Abrir Osteria, escolher dia, avançar/voltar e conferir conexão pendente. Botão Abrir Gestão da Osteria leva ao sistema próprio. Na prévia não há reservas reais, contagens nem queries externas. Comparações operacionais dependem de futuro ambiente com leitura restrita.
