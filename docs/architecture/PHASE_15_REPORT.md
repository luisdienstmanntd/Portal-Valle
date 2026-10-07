# Fase15 — Conceito da visão de estadia

## Objetivo

Criar o conceito agregador de estadia sem PMS. Proprietário escolheu cadastro próprio com apartamento/entrada/saída e vínculos explícitos.

## Implementado

Modelo e parser mínimos, UUIDs normalizados, validação de período/vínculo/lote e DTO sem identidade de hóspede. GetStayAgenda agrega quatro fontes independentes, conserva cancelamentos e fim desconhecido, impede associação por coincidência, distingue desconhecido/falha/vínculos vazios. Rota/menu Estadias mostra preparação do cadastro com controles desabilitados, sem dados fictícios.

## Arquivos criados/alterados

modules/stays/domain/application e testes; estadias/page; navegação/CSS; stays-preview/shell E2E; eslint ignore .next-program; docs.

## Banco

Nenhuma migration/tabela/RPC/FK, alteração de RLS/ENV, gravação, reassociação ou consulta externa. Check stay_id=null preservado. Nenhum reader de estadia em produção. Hospedado Portal continua adiado; testes de banco existentes serão revalidados em CI.

## Testes executados

142 unitários/check/lint/TypeScript e build locais PASS. Novos10 testes cobrem validação, outra estadia, vínculo ausente, PII extra, fronteira civil, duração, duplicação/limite, UUIDs, isolamento, timeout, zero somente vinculado e escopo antes de consulta. E2E56 locais PASS.

## Resultado dos testes

CI37529212227/f6e5f5cac43ed7c8beaa5cdf78ad494ee201a256 PASS:142unit/56prévia/198pgTAP/7HTTP/14Auth; build/advisors/checkpoints/cleanup PASS. Revisão final em fechamento, somente conceito.

## Riscos encontrados

Cadastros/vínculos operacionais ainda não existem. Modelo de teste não é prova de cadastro real ou posse da referência. Facilities/Osteria desconectados e sem correlação de estadia. Não mostrar ausência global ou histórico de pessoa a partir de apartamento.

## Pendências

Revisão final em fechamento. Persistência/RLS/RPCs auditados e fluxo de vínculo antes de operar. Fontes externas restritas, hospedado, tablet físico e Lora adiada permanecem pendentes.

## Commit

f6e5f5cac43ed7c8beaa5cdf78ad494ee201a256; CI37529212227 PASS.

## Próxima fase

Concluir operação da estadia em entrega própria antes de depender dela em relatórios. Fase16 exige dados confiáveis; não fabricar indicadores. Avanço automático autorizado não remove gates de acesso externo.

## Validação manual sugerida

Abrir Estadias pelo menu, conferir campos e estado em preparação. Home mantém informativo09–12/10. Não criar hóspedes/atividades de demonstração na prévia.

Fechamento conceitual: APROVADO TECNICAMENTE pelo subagente revisor; cadastro operacional será entrega separada. Avanço contínuo autorizado pelo proprietário em 2026-10-06.


> CANCELADA em 2026-10-07 por decisão do proprietário (ADR-018). Conteúdo acima é registro histórico; nada disso permanece no código.
