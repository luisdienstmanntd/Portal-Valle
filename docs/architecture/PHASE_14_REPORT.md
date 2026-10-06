# Fase14 — Resiliência

## Objetivo

Validar degradação isolada da Home para Osteria/Facilities/Portal offline, timeout, schema incompatível e ENV ausente.

## Implementado

Matriz de nove falhas nos contratos reais da agregação: offline, timeout e schema em cada fonte. Consultas válidas preservam entradas/resumos; fontes falhas não produzem zero, PII ou erro bruto. Testes adicionais comprovam início paralelo das quatro consultas, recuperação na próxima leitura e imutabilidade do resultado após resposta tardia. ENV ausente mantém preparação; seis combinações parciais falham fechadas, sem aceitar chave administrativa.

## Arquivos criados/alterados

home/application/resilience.test.ts; lib/supabase/config.test.ts; documentação de continuidade e evidências.

## Banco

Nenhuma alteração de runtime, migration, dependência, factory ou credencial. Nenhum banco hospedado/legado desligado ou consultado para induzir falhas. Auth/RLS permanecem ativos.

## Testes executados

Check local: lint/TypeScript/132 unitários PASS (15 novos). Build,52 prévias,198 pgTAP,7 HTTP,14 Auth E2E confirmados no CI37525732273. Prévia3100 segue build validado da Fase13, pois esta fase altera somente testes/documentação.

## Resultado dos testes

CI37525732273/aa5438f750c742786064b3e6cf4f40c291e3686a PASS:132unit/52prévia/198pgTAP/7HTTP/14Auth, build/advisors/checkpoints/cleanup PASS. APROVADO TECNICAMENTE pelo revisor independente.

## Riscos encontrados

Offline é injetado no contrato de leitura, não no transporte externo ainda inexistente. Timeout cobre provider não cooperativo. Validação não comprova disponibilidade de produção nem integração operacional externa. Queda que impeça autenticação não autoriza acesso aos dados: a guarda continua fechada antes da agregação. ENV parcial é erro de configuração, não preparação silenciosa.

## Pendências

APROVADO TECNICAMENTE pelo revisor independente. Integrações hospedadas e acesso restrito externo continuam pendentes. Tablet físico pendente. Lora adiada.

## Commit

aa5438f750c742786064b3e6cf4f40c291e3686a; CI37525732273 PASS.

## Próxima fase

Fase15 visão estadia, após estabilidade confirmada. Identidade/apartamento de Facilities/Osteria não faz parte dos DTOs atuais; não inferir vínculos entre hóspedes nem ampliar acesso como efeito colateral.

## Validação manual sugerida

Hoje mantém quatro fontes pendentes na prévia sem ENV. Conferir mensagens e navegação. Falhas são exercitadas com fixtures fictícias; nenhum dado operacional é colocado na prévia.
