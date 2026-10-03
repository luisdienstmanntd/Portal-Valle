# Supabase independente — Fase 3

## Ambientes e decisão do proprietário

Organização escolhida: `luisdienstmanntd` (`xrztdjyjajwkdweqyzgs`); nome pretendido `Portal-Valle-staging`; região `sa-east-1`. Consulta de custo retornou US$ 0/mês, confirmado pelo proprietário. Criação recusada por limite de dois projetos gratuitos ativos. O proprietário escolheu **validar em CI e adiar banco hospedado**. Nenhum projeto foi criado, pausado, apagado ou atualizado de plano. Nenhum recurso legado foi modificado.

Local/CI usa PostgreSQL 17 padrão e Supabase exclusivo efêmero, sem cópia de hóspedes. O host Windows atual não possui Docker; integração de banco é executada no Ubuntu do GitHub Actions. Produção e staging hospedado ainda não existem. Banco efêmero de CI não comprova defaults, backups ou comportamento do futuro projeto SaaS.

## Reproduzir em máquina com Docker

Node 24, Docker disponível e `npm ci`. Supabase CLI 2.119.0 está fixada no lockfile. O diretório de estado pode ficar no workspace: no PowerShell, `$env:SUPABASE_HOME = Join-Path (Get-Location) 'work/supabase-home'`; no Linux, `export SUPABASE_HOME="$PWD/work/supabase-home"`.

```text
npx supabase start
npx supabase db reset --local
npm run test:db
npm run test:integration
npx supabase stop --no-backup
```

`test:integration` captura URL/chave publicável do status local em memória; não imprime chaves nem usa service_role. O teste HTTP recusa qualquer destino hospedado. pgTAP executa transação com rollback e prova acesso anônimo negado, usuário autenticado sem acesso a linhas, mutações negadas, invariantes e defaults de futuros objetos. Não há usuários Auth persistentes nos testes.

Migration criada com `supabase migration new portal_foundation`: `20261003014150_portal_foundation.sql`. Sem SQL aplicado a projetos externos. `portal_settings` guarda apenas timezone fixo e instante de criação. RLS habilitada/forçada, SELECT concedido somente a authenticated, **nenhuma policy permite linhas** até RBAC da Fase 4. Demais grants são revogados. Defaults globais e por schema são tratados; PUBLIC EXECUTE global merece atenção específica. Migrations futuras concedem privilégios/policies explicitamente. A opção temporária `auto_expose_new_tables` não é utilizada.

## Clientes e configuração

Sem ENV, o shell continua disponível. Para habilitar clientes, fornecer conjuntamente `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_SUPABASE_PROJECT_REF` em arquivo ignorado ou secrets do ambiente. Hosted exige HTTPS, hostname correspondente ao ref e chave `sb_publishable_`; os dois refs legados são bloqueados. Local aceita apenas `http://127.0.0.1:<porta>` com ref `local`. Chaves privilegiadas/JWT antigos são rejeitados.

`browser.ts` usa createBrowserClient; `server.ts` é server-only e cria cliente por requisição, com cookies getAll. Atualização Fase 4: leitura padrão em Server Components e escrita explícita para Server Actions. Proxy de renovação/cookies/cache privado e login/logout implementados; páginas configuradas consultam Auth/perfil com RLS. Sem ENV, shell é somente preparação e login fica desabilitado. Consulte AUTH_AND_RBAC.

`database.types.ts` é contrato tipado manual de portal_settings, portal_profiles e portal_role, validado pelos testes SQL; não foi apresentado como resultado de geração remota. Quando houver ambiente hospedado, gerar tipos a partir do schema real e revisar o diff.

## Prévia preservada durante checks

A prévia solicitada continua na porta 3100. `PORTAL_NEXT_DIST_DIR=.next-check` separa build de verificação da pasta servida. `PORTAL_E2E_PORT=3102` permite testar esse build em servidor separado sem navegar a aba do proprietário. Os arquivos gerados next-env.d.ts/tsconfig.json são restaurados à configuração normal após o build isolado; CI usa `.next` padrão.

## Antes de hospedagem e Auth

Resolver quota/custo com nova aprovação se houver cobrança; confirmar plano, backups e recuperação antes de dados reais. Criar Portal-staging separado, aplicar migrations com revisão do SQL e conferir RLS/grants/catálogos/advisors no ambiente real. Signup público deve ficar desabilitado no projeto hospedado (config.toml controla apenas stack local). Conferir configuração Auth, URL/refs/chaves próprias e regenerar tipos. Produção exige outro projeto próprio; não usar staging como produção.
