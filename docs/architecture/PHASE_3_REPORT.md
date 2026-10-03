# Fase 3 — Supabase Portal

Status: CONCLUÍDA no escopo CI aprovado pelo proprietário; CI/checks/E2E PASS e APROVADO TECNICAMENTE pelo revisor independente. Banco hospedado adiado por decisão expressa do proprietário.

## Objetivo

Preparar banco exclusivo do Portal, migrations/RLS, clientes e validação ENV, sem Auth/RBAC operacional ou experiências completas.

## Implementado

Migration mínima de portal_settings, RLS/grants e defaults privados; Supabase CLI/JS/SSR fixados; clientes browser e server de leitura por requisição; contrato tipado; identidade de ambiente e rejeição de chaves privilegiadas; pgTAP e testes HTTP reais; job isolado de CI. Shell permanece acessível sem ENV e sem consultas de banco.

## Arquivos criados

`supabase/config.toml`, `.gitignore`, migration, seed e testes SQL; `src/lib/supabase/{config,browser,server,database.types}.ts`; `tests/integration/supabase.test.ts`; `scripts/test-local-supabase.mjs`; este relatório e SUPABASE_SETUP.

## Arquivos alterados

package.json/lock; ENV validator/testes e exemplo; Vitest/CI; configuração Next/ESLint/Playwright para verificar sem interromper prévia; README e documentação de continuidade.

## Banco

Supabase hospedado **ADIADO pelo proprietário** após criação recusada por quota gratuita. Custo consultado US$ 0/mês não garantiu elegibilidade. Nome pretendido Portal-Valle-staging, organização luisdienstmanntd, região São Paulo. Nenhum legado alterado. CI cria/apaga exclusivamente stack efêmero PostgreSQL 17 do próprio checkout. Não há banco operacional/backup hospedado.

## Testes executados

Build isolado PASS. Primeira checagem local PASS com 15 unit; uma checagem posterior detectou lint indevido nos artefatos .next-check, corrigido com ignore específico. Nova execução PASS (lint/TypeScript/16 unit). 20 E2E contra build atual isolado na porta 3102 PASS nos quatro viewports. O teste de origens foi ajustado para respeitar a porta configurada. PostgreSQL/pgTAP/HTTP exigem CI porque Docker não está instalado neste Windows.

## Resultado dos testes

PASS: check local (lint/TypeScript/16 unit), build isolado e 20 E2E do build atual. [CI 37087962869](https://github.com/luisdienstmanntd/Portal-Valle/actions/runs/37087962869) PASS nos jobs checks/e2e/database, com npm ci. Database aplicou/resetou migration, executou 22 asserts pgTAP (Result: PASS), 3 HTTP reais e encerrou stack isolado. npm audit --omit=dev retornou zero vulnerabilidades conhecidas. PostgreSQL não foi executado no Windows.

## Riscos encontrados

Quota gratuita; CI não reproduz configuração SaaS nem backups; cliente server apenas leitura, proxy/setAll pertence à Fase 4; tipos atuais manuais. Documentados em SUPABASE_SETUP e KNOWN_ISSUES.

## Pendências

Projeto hospedado antes de Auth conectado/deploy, com plano/backup aprovados. Não há pendência técnica do escopo CI desta fase. Nenhum usuário/hóspede real.

## Commit

Implementação: `c1d2b6f` (feat(portal): prepare isolated Supabase foundation and RLS tests), publicada em main; CI 37087962869 PASS. Fechamento documental: commit docs(portal): close phase three after successful database CI; SHA consultável no histórico.

## Próxima fase

Fase 4 — Auth/RBAC, somente após conclusão técnica da Fase 3 e autorização explícita.

## Validação manual sugerida

Manter http://127.0.0.1:3100/hoje aberta; testar navegação. A Fase 3 não muda aparência nem torna ações operacionais disponíveis. Verificar job database do CI e reproduzir reset/pgTAP/HTTP somente em ambiente de teste.
