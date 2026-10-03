# Matriz de testes planejados

**Fase 0:** sem produto executável. Nenhum teste de código abaixo foi implementado ou executado. As verificações desta fase foram inspeção de fontes, catálogos PostgreSQL com transações `READ ONLY`, estrutura documental e ausência de credenciais no material criado.

| Requisito | Fase | Teste/critério futuro |
| --- | ---: | --- |
| TypeScript strict, lint, build | 1/2 | `npm run check` e `npm run build` locais PASS; CI Fase 1 com `npm ci` PASS; Fase 2 aguarda publicação |
| Navegação teclado/touch/tablet | 2 | `tests/e2e/shell.spec.ts`: menu/8 rotas/aria-current; modal Tab/Shift+Tab/Esc/retorno de foco; skip-link; 404; sem overflow; alvos de navegação ≥44px; 16 PASS nos 4 viewports |
| Assets locais/hidratação | 2 | E2E `shell.spec.ts` em Hoje: sem pageerror nem requisições externas; fontes locais carregadas e capturas inspecionadas |
| ENV separada e erro claro | 1/3 | `src/lib/env.server.test.ts` 3 PASS + build sem segredos; chaves reais só na Fase 3 |
| RLS/grants/contas ativas | 3/4 | integração Supabase local por anon, sem vínculo, recepção, gerência, admin, inativo |
| Login/logout/renovação | 4 | E2E de Auth Portal e Server Actions protegidas |
| Capacidade persons/bookings/units/unlimited | 5/6 | testes domínio com builders e consultas DB reais |
| Última vaga sob concorrência | 6 | integração com duas transações paralelas, uma recusada |
| Idempotência e alteração da reserva | 6 | retry, payload divergente, edição/cancelamento/reativação/transferência |
| Auditoria no mesmo commit/rollback | 5/6 | DB integração: falha de auditoria desfaz mutação |
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
