# Fase 3 — Supabase Portal

Status: implementação local em revisão; validação de banco no CI pendente. Não considerar fase concluída até registrar CI PASS e APROVADO TECNICAMENTE.

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

Pendente confirmação final local/CI. Não afirmar execução de testes de banco até evidência do job database.

## Riscos encontrados

Quota gratuita; CI não reproduz configuração SaaS nem backups; cliente server apenas leitura, proxy/setAll pertence à Fase 4; tipos atuais manuais. Documentados em SUPABASE_SETUP e KNOWN_ISSUES.

## Pendências

CI e revisão final desta implementação; projeto hospedado antes de Auth conectado/deploy, com plano/backup aprovados. Nenhum usuário/hóspede real.

## Commit

Obter implementação com `git log`; SHA/CI serão registrados após publicação para validação.

## Próxima fase

Fase 4 — Auth/RBAC, somente após conclusão técnica da Fase 3 e autorização explícita.

## Validação manual sugerida

Manter http://127.0.0.1:3100/hoje aberta; testar navegação. A Fase 3 não muda aparência nem torna ações operacionais disponíveis. Verificar job database do CI e reproduzir reset/pgTAP/HTTP somente em ambiente de teste.
