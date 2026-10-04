# Matriz de testes planejados

**Fase 0:** sem produto executável. Nenhum teste de código abaixo foi implementado ou executado. As verificações desta fase foram inspeção de fontes, catálogos PostgreSQL com transações `READ ONLY`, estrutura documental e ausência de credenciais no material criado.

| Requisito | Fase | Teste/critério futuro |
| --- | ---: | --- |
| TypeScript strict, lint, build | 1/2 | `npm run check` e `npm run build` locais PASS; CI Fases 1/2 com `npm ci` PASS; Fase 2 run 37086206304 |
| Navegação teclado/touch/tablet | 2 | `tests/e2e/shell.spec.ts`: menu/8 rotas/aria-current; modal Tab/Shift+Tab/Esc/retorno de foco; skip-link; 404; sem overflow; alvos de navegação ≥44px; 16 PASS nos 4 viewports, local e CI |
| Assets locais/hidratação | 2 | E2E `shell.spec.ts` em Hoje: sem pageerror nem requisições externas; fontes locais carregadas e capturas inspecionadas |
| ENV separada e erro claro | 1/3 | `src/lib/env.server.test.ts`: 16 PASS local; parcial, segredos, transporte/identidade, refs legados e loopback |
| RLS/grants | 3 | `supabase/tests/portal_foundation.test.sql`: 22 asserts pgTAP PASS; `tests/integration/supabase.test.ts`: 3 HTTP reais PASS no CI 37087962869, com reset/migration e stop isolados |
| Contas ativas e membership | 4 | supabase/tests/portal_auth.test.sql: 41 asserts; total SQL 63 PASS no CI 37090654113; Auth/RLS reais e cadastro público bloqueado PASS |
| Login/logout/renovação | 4 | tests/e2e-auth/login.spec.ts: 14 PASS no CI 37090654113; login/logout/reload, renovação, roles e revogação |
| Capacidade persons/bookings/units/unlimited | 5/6 | Fase5: model.test.ts/mapping.test.ts (26 novos unit PASS local; total67); SQL/RLS em portal_experiences.test.sql: 50 novos asserts, total113 PASS no CI37151730319; 7 HTTP PASS. Fase6 fará concorrência real. |
| Última vaga sob concorrência | 6 | integração com duas transações paralelas, uma recusada |
| Idempotência e alteração da reserva | 6 | retry, payload divergente, edição/cancelamento/reativação/transferência |
| Auditoria no mesmo commit/rollback | 5/6 | Fase5: portal_experiences.test.sql provoca falha do INSERT audit e verifica rollback da reserva; PASS no CI37151730319. |
| Status e presença independentes | 5/6 | unit + E2E Lora |
| Filme/local/unidade Cine | 7 | domínio, validação e E2E focal |
| La Vera Pizza sem financeiro | 8 | domínio, integração, E2E focal |
| Semana deriva occurrences | 9 | query/projeção e alteração refletida |
| Duplicação sem reservas/presença | 9 | unit + integração com virada mês/ano/fuso e retry |
| Dia do hotel | 9/10 | unit com relógio injetado e fusos divergentes |
| Agenda parcial sob falha | 10/13/14 | unit `Promise.allSettled` + E2E provider indisponível |
| Facilities mapping e schema | 11 | contract tests com fixtures, vazio, timeout, permissão |
| Osteria mapping e schema | 12 | contract tests com bloqueio/cancelamento/ROOM/status, 401/403 |
| Consulta externa realmente read-only | 11/12 | revisão grants/policies e teste em ambiente isolado autorizado; nunca mutar produção |
| Dados pessoais não vazam | 1–14 | auditoria server/client bundle, logs e responses |
| Fundação responde HTTP | 1/2 | `tests/e2e/foundation.spec.ts` PASS nos 4 projetos de viewport; servidor pré-iniciado no Windows |

Quando o teste existir, substituir esta coluna por caminho concreto e resultado do CI. Não promover uma fase com testes aplicáveis vermelhos.

Fase6 adaptada Cine: commands.test.ts + hotel-time, check local83unit PASS. portal_cinema.test.sql (RPC/Auth/idempotência/versões/crianças/unidades/rollback), scripts/test-cinema.mjs (HTTP/concorrência/cancelamento/redução), login.spec.ts (fluxo UI/papéis), cinema-preview.spec.ts (4viewports). Banco/Auth/CI confirmado PASS em CI37155203841. Transferência não suportada e recusada.

Resultado Fase6: CI37155203841/db28d2b PASS:83unit/28preview/140pgTAP (27novos)/7HTTP/14AuthE2E e checkpoints concorrência/idempotência/versões/cancelamento/redução/crianças. Advisors/cleanup PASS. Duas tentativas AuthUI12/14 corrigidas no teste sem remover assertions; APROVADO TECNICAMENTE pelo revisor independente.

Fase 8: check/build local PASS (85 unit); 32 prévias E2E PASS nos 4 viewports. commands.test.ts cobre Pizza 12/13 adultos, notas CHD, rejeição de financeiro/filme e quantidade estruturada de crianças. portal_pizza.test.sql cobre grants/Auth, categoria/slug, unidades zero, idempotência entre fluxos, capacidade/redução/cancelamento e auditoria sem PII. scripts/test-pizza.mjs é chamado por test-cinema.mjs com clientes já autenticados: concorrência na última vaga, retry, versão, cancelamento/reativação e preservação de observações. login.spec.ts testa Cine e Pizza com gerência em dois viewports. SQL/HTTP/Auth PASS no CI37158542094.

Resultado Fase 8: CI37158542094/a5fa1caf32be3599d7af5d63ea1db7a28fc647ba PASS: 85 unit, 32 prévias E2E, 169 pgTAP, 7 HTTP, 14 Auth E2E e checkpoints Cine/Pizza de concorrência, idempotência, notas CHD, versões e cancelamento; advisors e cleanup PASS.
Fechamento da Fase 8: APROVADO TECNICAMENTE pelo revisor independente.

Fase9: week.test.ts cobre segunda/domingo/viradaano/fuso/offset histórico/data inválida; check89unit/buildPASS. week-preview.spec.ts cobre 4viewports/navegação/duplicação desabilitada/semoverflow. portal_week.test.sql: grants/permissão/retry/payloaddivergente/novosIDs/draft/version1/responsável/semhóspedes/presençaoriginal/ano/offset/fontevazia/destinoocupado/auditoria. test-week.mjs ligado em testCinema cobre duplicações concorrentes e criador manual, idempotência, sembookings e roles. Authgerência projeta Cine/Pizza, duplica, abre cópia sem reservas. CI37168649494 PASS.

Fase9 CI37168251847/994642e: checks/e2e PASS,196pgTAP/7HTTP e checkpoints semanal/Cine/Pizza PASS; Auth13/14, locator aguardava título repetido na lista antes do redirect. Corrigido para heading level1 sem remover assertions. Cobertura adicional de editar/cancelar cópia e reflexão na semana; faixa1900–2099 em nova migration20261004013531, não editar versão já publicada. Navegação extrema omitida, destino padrão fora da faixa fica vazio; CI da correção37168649494 PASS.

Resultado final Fase9: CI37168649494/509542335c787ad4dde34635aa1b9290d1431dd9 PASS: 89 unit, 36 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints de duplicação concorrente/criação manual/idempotência/sem inscrições, Cine/Pizza, advisors e cleanup PASS.
Fechamento Fase9: APROVADO TECNICAMENTE pelo revisor independente.

Fase 10: 97 unitários PASS (datas/fronteiras DST/1900–2099; estados/ordenamento/deadline/abort/DTO/limites/PII), check/build PASS, 40 prévias E2E PASS nos quatro viewports. Agenda: datas inválidas, limites e navegação; conexão pendente sem falso vazio. Auth CI adiciona sessões Cine/Pizza Hoje/Agenda, ausência de hóspede/apartamento na timeline, detalhe autorizado e dia consultado vazio. CI37170139071 concluído com PASS, contagens abaixo.

Resultado final Fase10: CI37170139071/c639381de43eb842e955f54242965817794f68b2 PASS: 97 unitários, 40 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints Agenda/Cine/Pizza/semana, advisors e cleanup PASS.

Fase11 locais:103 unitários/check/build PASS,44 prévias E2E PASS. Contratos: schema/PII/slots/calendário/DST/duplicatas/limites/completude/401/403/falha/timeout/releitura após exclusão. UI quatro viewports: data/navegação/limites/sem zero/sem requests externos/link original. CI37170970533 PASS; nenhum teste de escrita ou reserva real no legado.

Resultado preparação Fase11: CI37170970533/0630c5374590375e91059f40691f5082e4df9ca9 PASS: 103 unitários, 44 prévias E2E, 198 pgTAP, 7 HTTP e14 Auth E2E; checkpoints/advisors/cleanup PASS. Integração operacional continua pendente; nenhum acesso externo de leitura de reservas foi habilitado.

Fase12:112 unitários/check/build locais PASS; contratos sobre flags/bloqueios/vazios/cancelamento/restauração/roomservice/mesa textual/segundos/horários extras/join ausente/PII/schema/duplicatas/limites/completude/401/403/timeout. Hotel-time minutos/segundos/offset1900/DSTgap PASS. E2E públicos48 PASS; Auth testa recepção/Osteria desconhecida/link/logout/redirecionamento. CI pendente.
