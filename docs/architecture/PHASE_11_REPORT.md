# Fase 11 — Facilities somente leitura: preparação

## Objetivo

Auditar acesso e preparar adapter, reservas do dia, resumo e contract tests, preservando o sistema externo.

## Implementado

Contrato de leitura injetado, DTO mínimo sem PII, validação de slots/data/instalação e IDs estáveis. Resposta exige complete=true; nenhuma truncagem silenciosa. Estados unknown/unavailable/empty/available, deadline/AbortSignal e erros sanitizados. Piscina/Academia têm seleção de data, navegação, conexão pendente e link original. Factory de produção retorna null incondicionalmente, sem credenciais, ENV de ativação ou chamadas externas.

## Arquivos criados/alterados

modules/facilities/domain/application/infrastructure/ui e testes; páginas piscina/academia; E2E de prévia; documentação.

## Banco

Proprietário autorizou consulta adicional somente de metadados. BEGIN READ ONLY confirmou reservations/active_stays com RLS=true, policies=[], views=[] no projeto candidato fjwqnoojvtdiytedtfwt. Grants anteriormente consultados incluem escrita para postgres/service_role. Snapshot Git eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0 inalterado. Sem acesso SELECT-only comprovado, sem dados operacionais/segredos lidos, nenhuma alteração ao legado ou banco. Não há migration Portal.

## Testes executados

Check/103 unitários PASS e build local PASS; 44 E2E públicos nos quatro viewports PASS. Contract tests cobrem slots, enums, DST gap, duplicatas, excesso, schema divergente/PII, 401/403/falha, resposta incompleta, timeout e releitura após exclusão. CI concluído; parecer final independente pendente.

## Resultado dos testes

CI37170970533/0630c5374590375e91059f40691f5082e4df9ca9 PASS: 103 unitários, 44 prévias E2E, 198 pgTAP, 7 HTTP e14 Auth E2E; checkpoints/advisors/cleanup PASS. Build final .next e4 testes Facilities focalizados PASS. APROVADO TECNICAMENTE pelo revisor independente para a preparação, não para a conexão operacional.

## Riscos encontrados

Não há acesso restrito disponível. Um port de leitura não transforma credencial administrativa em SELECT-only. Transport futuro deve provar completude e selecionar apenas id/facility/reservation_date/slot_start. Cancelamento externo é exclusão; nenhuma presença/status/pessoas inventados. Nenhuma ocupação percentual ou disponibilidade inferida.

## Pendências

Fase11 operacional pendente: interface oficial/identidade restrita e contrato da origem ainda não disponíveis. Não solicitar service_role nem modificar origem neste escopo. Adapter e telas preparados, conexão desabilitada. CI PASS; preparação APROVADA TECNICAMENTE.

## Commit

Implementação 0630c5374590375e91059f40691f5082e4df9ca9 publicada, CI37170970533 PASS. Fechamento documental posterior.

## Próxima fase

Não declarar Fase11 operacional concluída. Preparação de Osteria poderá avançar preservando gates externos e autorização automática do proprietário.

## Validação manual sugerida

Abrir Piscina/Academia, escolher data, navegar por dias e conferir conexão pendente sem zero. Abrir o sistema original somente se desejar consultar/reservar por seu fluxo normal. Não inserir dados reais nos testes.
