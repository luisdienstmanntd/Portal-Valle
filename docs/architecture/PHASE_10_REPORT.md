# Fase 10 — Agenda diária

## Objetivo

Reunir sessões do Portal em Hoje e Agenda, inicialmente apenas Cine Toscana e La Vera Pizza.

## Implementado

GetDailyAgenda agrega fontes isoladas por Promise.allSettled, com timeout/AbortSignal, validação estrita de payload e ordenação determinística. Distingue conexão pendente, consulta indisponível, consulta vazia e sessões disponíveis. Timeline compartilhada, seleção de data e navegação diária no fuso America/Sao_Paulo, limites 1900–2099 e intervalo semiaberto. Sessões noturnas pertencem ao dia de início; término em outro dia mostra a data. Links levam ao detalhe autorizado. Sem hóspedes, apartamentos ou contagens de reservas na timeline. Piscina, Academia e Osteria permanecem em preparação.

## Arquivos criados/alterados

modules/agenda/domain/application/infrastructure/ui; lib/hotel-date e testes; agenda/page e hoje/page; queries de experiências com abort; revalidação Hoje/Agenda nas actions existentes; CSS; fixture sintética e E2E Auth/prévia; documentação.

## Banco

Nenhuma migration, permissão ou tabela nova. Leitura das occurrences e catálogo próprios pelo cliente autenticado, preservando RLS. Nenhum acesso ou alteração aos legados. Hospedado adiado conforme decisão do proprietário.

## Testes executados

Lint, TypeScript, 97 unitários, build e 40 E2E de prévia em quatro viewports locais. Inspeção visual desktop e prévia 3100 aberta. Testes Auth/banco/HTTP em CI Linux isolado pendentes nesta publicação.

## Resultado dos testes

Check/build e 40 prévias PASS. Revisor independente não encontrou bloqueios pré-CI. Aprovação final aguardando CI.

## Riscos encontrados

Sem conexão hospedada, a prévia mostra conexão pendente: isso não confirma dia vazio. Provider limitado a 100 sessões; excesso ou payload inválido torna a consulta indisponível. Fixture Auth de Hoje usa relógio real; eventual virada do dia entre seed e E2E exige nova execução. Tablets físicos e contas reais pendentes.

## Pendências

CI e aprovação final. Integrações Facilities/Osteria nas próximas fases, respeitando gates de segurança. Lora adiada.

## Commit

Implementação nesta publicação; hash e CI serão registrados após validação.

## Próxima fase

Fase 11 — adapter Facilities somente leitura. Avanço automático autorizado pelo proprietário; preservar gates e legados.

## Validação manual sugerida

Abrir Hoje e Agenda, escolher data/avançar/voltar. Na prévia sem ENV, conferir conexão pendente e áreas externas em preparação. No ambiente Auth de teste, conferir sessões e navegar ao detalhe; nomes de hóspedes/apartamentos aparecem somente no detalhe autorizado.
