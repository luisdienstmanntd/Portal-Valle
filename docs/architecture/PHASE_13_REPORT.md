# Fase13 — Home Hoje

## Objetivo

Reunir Experiências, Piscina, Academia e Osteria em cards, timeline e estados de integração, isolando falhas.

## Implementado

GetHotelDay agrega as aplicações concretas via allSettled, com timeout por fonte e DTO sem identidade de hóspedes. Quatro cards distinguem unknown/unavailable/empty/available; contagens somente após consulta válida. Timeline ordenada, IDs compostos, estado de cancelamento e links aos módulos. Osteria sem fim/duração inventada e horários com segundos civis. Vazio global somente quando todas as fontes forem consultadas/vazias. Portal pode mostrar sessões enquanto externos continuam pendentes.

## Arquivos criados/alterados

modules/home/application/ui e testes; hoje/page; guardPreparationPage retorna Staff/null; CSS; E2E Home; documentação.

## Banco

Nenhuma migration, tabela, credencial ou permissão nova. Factories Facilities/Osteria seguem null. Home aplica can por fonte antes de obter reader/provider, depois de guard portal.read. Sem query/alteração em bancos externos. Auth/RLS Portal existente.

## Testes executados

Check/lint/TypeScript e117unitários locais PASS. Build e52 prévias E2E locais PASS; CI pendente. Unit cobre quatro estados, ordenação/IDs, meia-noite/segundos, ausência de PII, falha/timeout/schema isolados e data inválida antes de consulta. Fixtures somente fictícias.

## Resultado dos testes

117 unitários/check/build e52 prévias E2E locais PASS; CI e parecer final pendentes.

## Riscos encontrados

Conexões externas ainda pendentes de acesso restrito; nenhum zero ou disponibilidade real inferidos. Homepage reúne status e contratos preparados, não habilita integrações operacionais11/12. Sem ENV própria é preparação, não teste de produção hospedada. Tablet físico pendente.

## Pendências

Finalizar validação, CI e revisão. Acesso restrito externo, banco hospedado Portal e equipe real pendentes. Lora adiada.

## Commit

Implementação nesta publicação; registrar hash/CI após validação.

## Próxima fase

Fase14 resiliência, avanço automático autorizado. Não habilitar fontes externas como efeito colateral.

## Validação manual sugerida

Abrir Hoje, conferir quatro cards e estados, Atualizar dia e links para áreas. Na prévia todas as conexões pendentes sem contagens. No CI autenticado sessões Portal reais de teste permanecem na timeline, externos pendentes. Falhas externas exercitadas por fixtures, não por mutações em produção.
