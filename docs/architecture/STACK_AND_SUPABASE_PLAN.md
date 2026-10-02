# Portal Valle — stack e plano Supabase (subsídio da Fase 0)

Consulta: 01/10/2026, aproximadamente 23:33 UTC. Escopo: leitura de documentação oficial, changelog e metadados públicos do npm. Nenhum pacote instalado, projeto criado, banco listado/consultado, migration aplicada ou deploy executado por esta análise.

## Decisão proposta

Novo aplicativo Next.js App Router, Node 24 LTS, React, TypeScript strict, Tailwind e Supabase próprio. O Next.js atende interface e fronteira de servidor; não há necessidade inicial de uma API independente, ORM, estado global, fila, motor genérico de eventos ou Realtime. Os adaptadores externos ficam exclusivamente no servidor, com capacidade real de somente leitura a ser confirmada antes das Fases 11 e 12.

As versões abaixo formam uma **candidata compatível pelos requisitos declarados**. Não é uma combinação instalada/testada. Instalação limpa, árvore de peers, TypeScript, lint, testes e build da Fase 1 devem confirmar o conjunto. Um arquivo de metadados acompanha esta proposta para tornar as evidências reproduzíveis. Fixar versões diretas sem `^`/`~`, gerar e versionar `package-lock.json` somente na implementação autorizada e usar `npm ci` no CI.

## Versões exatas propostas

Ambiente e fundação:

- Node.js **24.21.0**, linha LTS Krypton; `.nvmrc` exato para local/CI. Vercel seleciona a linha **24.x**, não garante patch fixo de runtime; registrar a versão efetiva no build.
- npm **11.19.0**, distribuído junto de Node 24.21.0; evitar trocar automaticamente para npm 12.
- `next` **16.3.8**, `eslint-config-next` **16.3.8**; App Router, runtime Node, React Compiler opcional desabilitado inicialmente.
- `react` e `react-dom` **19.3.0**, ambos na mesma versão.
- `typescript` **5.9.3**, com `strict: true`, `noEmit: true`; `@types/react` e `@types/react-dom` **19.3.0**; `@types/node` **24.19.1**.
- `tailwindcss` e `@tailwindcss/postcss` **4.3.3**; `postcss` **8.5.28**. Componentes locais pequenos e tokens portados conscientemente da referência visual, depois de inspecioná-la. Não instalar um kit UI inteiro por antecipação.
- `eslint` **9.39.5**, configuração flat. Executar lint explicitamente: `next build` não o executa automaticamente em Next 16.

Dependências introduzidas somente quando sua fase precisar:

- `@supabase/supabase-js` **2.117.2** e `@supabase/ssr` **0.12.7**, clientes separados browser/server e contexto de sessão por requisição (Fase 3/4).
- `zod` **4.6.5**, para entradas, respostas externas e variáveis de ambiente.
- `vitest` **5.0.3** e `vite` **8.3.2**, apenas ambiente de testes e configuração; Vite não substitui o build Next.
- `@playwright/test` **1.63.0**, para fluxos de navegador. Instalar os browsers correspondentes a essa versão no CI autorizado.
- `date-fns` **4.4.0**, para operações de calendário; `@date-fns/tz` **1.5.0** apenas ao implementar conversão/aritimética em `America/Sao_Paulo`. A extensão tem justificativa concreta: a data operacional do hotel não pode variar com o fuso da máquina ou do navegador. `Intl.DateTimeFormat` atende exibição simples sem nova dependência.
- `lucide-react` **1.49.0**, importações nominais; `sonner` **2.0.8**, feedback de operações, sem substituir mensagens de validação acessíveis nos campos.
- Supabase CLI **2.119.0** como ferramenta de desenvolvimento/CI (Fase 3); não é dependência de runtime. Consultar `--help` da versão fixada antes de usar comandos. Gerar arquivos de migration pela CLI, nunca inventar timestamps.

Não instalar agora pacotes de teste DOM, form manager, React Query, analytics ou pacotes Supabase adicionais. Vitest em ambiente Node atende regras puras; Playwright cobre o fluxo real. Qualquer necessidade posterior recebe justificativa e versão verificada.

## Compatibilidade verificada e limites

- Next 16.3.8 declara Node `>=20.9.0`, React/React DOM `^19.0.0` entre os peers aceitos e Playwright `^1.51.1` como peer opcional. O conjunto escolhido satisfaz esses intervalos. A documentação exige TypeScript >=5.1.
- Supabase JS 2.117.2 exige Node `>=22.0.0`; SSR 0.12.7 exige Supabase JS `^2.114.0`. Node 24.21.0 e JS 2.117.2 atendem. O mínimo Node do Next sozinho seria insuficiente para esta stack.
- Vitest 5.0.3 exige Node `^22.12.0 || ^24.0.0 || >=26.0.0` e aceita Vite `^6.4.0 || ^7.0.0 || ^8.0.0`. Vite 8.3.2 exige Node `^20.19.0 || >=22.12.0`. Playwright 1.63.0 exige Node >=20. O candidato Node 24 atende todos.
- ESLint 10.11.0 era `latest`, mas os plugins React 7.37.5, Import 2.32.0 e JSX A11y 6.10.2, usados por eslint-config-next 16.3.8, declaram suporte até ESLint 9. Escolher **9.39.5**, sem `--force` nem `--legacy-peer-deps`.
- TypeScript 7.0.2 era `latest`, mas typescript-eslint 8.71.0 declara TypeScript `>=4.8.4 <6.1.0`. Escolher **5.9.3** de forma conservadora. **6.0.3** é alternativa que satisfaz esse peer, sujeita à revisão de mudanças de configuração e aos mesmos gates. Não afirmar suporte a TypeScript 7 a partir do peer amplo do Next.
- React DOM 19.3.0 declara React `^19.3.0`. Lucide e Sonner aceitam React 19. Tipos React DOM 19.3.0 exigem `@types/react ^19.3.0`.
- Tailwind Oxide 4.3.3 exige Node >=20. O plugin PostCSS 4.3.3 fixa Tailwind 4.3.3 e aceita PostCSS `^8.5.16`, que inclui 8.5.28.
- Next App Router inclui internamente uma distribuição React associada ao framework; registrar `react` e `react-dom` continua necessário para o ecossistema. Peers satisfatórios não comprovam compatibilidade funcional de componentes antigos portados da referência.

Gates da futura Fase 1: resolver dependências sem ignorar peers; revisar lockfile, scripts de instalação e avisos; executar checagem de tipos, ESLint, Vitest, Playwright aplicável e `next build`. Verificar comportamento desktop/tablet e suporte dos tablets reais ao baseline dos browsers. Fazer auditoria de vulnerabilidades e triagem dos resultados na instalação; esta Fase 0 não afirma ausência de vulnerabilidades nem reproduz um `npm audit` inexistente.

## Supabase novo: proposta por fase

Fase 0 registra a intenção. Fase 3 cria o ambiente pertencente exclusivamente ao Portal, após sua autorização. O Supabase existente da Piscina/Academia e eventual backend da Osteria não recebem migrations, roles, policies, credenciais novas ou gravações durante essa criação.

Antes do provisionamento, registrar conta/organização proprietária, responsáveis, plano/custo aceito, região, política de backup e requisitos de recuperação. Preferir região próxima de Gramado e do runtime Vercel (São Paulo se disponível), confirmando disponibilidade real no ato. Não supor região ou capacidade contratada.

Separação proposta:

- Local/CI: Supabase local com dados sintéticos e migrations reproduzíveis, sem cópia de hóspedes reais.
- Preview/staging: projeto Supabase exclusivo de homologação do Portal, com Auth e chaves próprias. Previews Vercel apontam apenas a esse ambiente; testes que escrevem usam namespaces/dados isolados ou ambiente efêmero quando necessário.
- Produção: outro projeto próprio do Portal, criado antes do primeiro go-live. Nenhum preview utiliza seu banco. Se custo não permitir staging hospedado agora, manter validação local e adiar preview conectado em vez de compartilhar produção.

Usar PostgreSQL padrão do Supabase. O changelog de 25/09/2026 informa rollout de **PostgreSQL 17.11 / 15.19**; propor a linha **17 padrão** e registrar a versão efetivamente provisionada. Não afirmar que o SaaS permite fixar para sempre um patch específico. OrioleDB estava em Public Beta em 01/10/2026, com limitações de recuperação; não há requisito que justifique essa variante para o Portal. Não usar extensões avançadas sem necessidade.

Fase 3 prepara migrations mínimas, contratos de ambiente, clientes e testes de conexão/RLS. Auth/RBAC completo pertence à Fase 4; experiências, occurrences, bookings e auditoria do domínio entram na Fase 5. Não antecipar todas as tabelas apenas porque constam do roadmap.

## Autenticação, autorização e ambiente

Auth próprio com contas individuais da equipe, acesso por convite/cadastro administrativo e signup público desabilitado como configuração inicial proposta. Não compartilhar contas entre recepcionistas: `created_by` e auditoria precisam identificar o operador. A matriz concreta entre recepção, gerência e admin deve ser validada antes da Fase 4; `can(user, permission)` centraliza decisões da UI/aplicação, e RLS/RPC aplica a regra no banco.

Preferir tabela de acesso da equipe que só administradores autorizados alteram; consultas e gravações verificam usuário ativo e permissão atual. A autorização não depende de `user_metadata`. Caso `app_metadata` seja usada como otimização, documentar que claims permanecem antigas até renovação do JWT; bloquear/desativar um funcionário deve produzir efeito sobre operações sensíveis sem esperar indefinidamente a expiração.

Next 16 usa `proxy.ts` para renovação da sessão. Seguir o cliente SSR oficial com cookies `getAll`/`setAll`; verificar identidade com `getClaims()`, e usar `getUser()` quando for necessário consultar o registro mais recente. `getSession()` isoladamente não é prova de identidade. Cada Server Action e Route Handler valida entrada e autorização; a presença de Proxy ou um botão oculto não constitui controle de acesso. Respostas de sessão e dados de hóspedes não devem ir para cache compartilhado/ISR.

Contrato de ENV proposto, sem valores neste documento:

- Browser: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; esses valores são públicos por desenho e pertencem somente ao Portal.
- Servidor: flags de integrações e, futuramente, credenciais de leitura limitadas distintas para cada fonte. Nenhum `NEXT_PUBLIC_` em segredo, token administrativo, senha de banco ou credencial de integração.
- CLI/CI de migrations: referência do projeto alvo e segredos próprios, separados do runtime da aplicação e dos ambientes Vercel. `.env.example` contém só nomes/placeholders; validar com Zod e nunca registrar valores em logs.
- Chave secreta/`service_role` não é requisito normal para ler/escrever dados operacionais do Portal. Se administração de usuários exigir privilégio, introduzir cliente administrativo isolado em módulo `server-only`, com acesso restrito e auditoria; nunca reutilizá-lo em consultas comuns.

## RLS e acesso aos dados

RLS em todas as tabelas de schemas expostos. Grants e policies por operação, com negação inicial; não assumir grants automáticos para novas tabelas. `authenticated` sozinho não comprova vínculo do funcionário ao Portal. Policies exigem usuário ativo e permissão aplicável. UPDATE precisa de SELECT correspondente, `USING` e `WITH CHECK` explícitos. A equipe poderá precisar ler as reservas de todos os operadores, logo não aplicar cegamente `created_by = auth.uid()` em todo dado operacional.

Views operacionais, se realmente necessárias, usam `security_invoker = true` na linha PostgreSQL 17. Preferir funções `SECURITY INVOKER`; funções privilegiadas excepcionais ficam em schema privado, com `search_path` fixado, nomes qualificados, proprietário mínimo e verificação explícita de identidade/permissão. Revogar EXECUTE de PUBLIC e conceder só ao papel apropriado. Expor uma RPC fina não deve criar um caminho alternativo de gravação que pule capacidade ou auditoria.

Testar anon, usuário autenticado sem vínculo, recepção, gerência, admin e usuário desativado em leituras e escritas. Testar tentativa de alteração de papel, troca de autoria e alteração indevida de apartamento/occurrence. Advisors complementam os testes; não provam a regra de negócio.

## Capacidade e auditoria: garantias do futuro schema

Proposta para detalhar nas Fases 5/6, sem implementar SQL nesta fase: cada mudança de booking que afeta ocupação deve bloquear a occurrence correspondente dentro da mesma transação, calcular consumo vigente e gravar somente se houver capacidade. Usar lock de linha (`SELECT ... FOR UPDATE`) e cobrir criação, aumento de pessoas/unidades, reativação, cancelamento e transferência; em transferência, bloquear ambas as occurrences em ordem consistente. Alterar a capacidade ou o modo de uma occurrence precisa passar pela mesma garantia. Somar no JavaScript e inserir depois é vulnerável a duas reservas simultâneas.

Preferir regra central no banco que não possa ser contornada por INSERT/UPDATE direto: RPC no contexto do usuário e triggers de integridade em todos os caminhos aplicáveis. Se for escolhido acesso exclusivo por RPC com funções privilegiadas em vez de DML sob RLS, documentar a necessidade e limitar privilégios numa ADR. Não combinar grants de escrita diretos com uma checagem presente apenas na RPC.

`persons`, `bookings`, `units` e `unlimited` são modos distintos. Validar números inteiros não negativos e consumo mínimo quando aplicável. Definir antes da Fase 5 quais status consomem capacidade, como crianças contam, o que é uma unidade do cinema e como mudanças em `default_capacity` afetam occurrences já publicadas. Sugestão a validar: `reserved`/`confirmed` consomem; `cancelled` não consome; `no_show` exige regra explícita. A capacidade efetiva de occurrence publicada precisa de semântica estável; não deixar mudança de default alterar reservas existentes silenciosamente.

Auditoria é registrada no banco, na mesma transação da alteração: ator derivado de `auth.uid()`, ação, entidade, instante, campos alterados e correlação. Evitar aceitar ator indicado pelo browser. Sem UPDATE/DELETE pelo usuário operacional; INSERT é produzido pelo caminho autorizado, por exemplo trigger privado com privilégio mínimo. Não guardar tokens, senhas, conteúdo completo de requisições ou cópias desnecessárias de telefone/observações na auditoria. Definir retenção e leitura gerencial antes da operação real.

Testes imprescindíveis: duas reservas concorrentes disputando última vaga, edição que excede capacidade, cancelamento/repetição idempotente, reativação concorrente, redução de limite, transferência entre occurrences, acesso direto tentando pular a regra e falha de auditoria revertendo a transação. Usar banco real local para concorrência; mocks unitários não comprovam atomicidade.

Datas de realização são instantes `timestamptz`; consultas de dia usam intervalo `[início local, início do dia seguinte)` em `America/Sao_Paulo`, convertido a UTC. Datas operacionais sem hora são `date`/LocalDate, não `new Date('YYYY-MM-DD')` dependente de conversões implícitas. Duplicar semana desloca datas locais, preserva hora local e nunca copia bookings/presença; cobrir virada de ano/mês e particularidades do fuso.

## Changelog relevante e riscos

1. Supabase JS deixou de suportar Node 20 em 30/06/2026; razão concreta para Node 24 LTS, mesmo que Next aceite 20.9.
2. Rollout PostgreSQL 17.11/15.19 traz mudanças em ltree, cifragens pgcrypto antigas, btree_gist e operadores personalizados. Um projeto novo sem esses recursos evita migração desse legado; isso não autoriza manutenção dos bancos existentes.
3. Desde 05/08/2026, o Supabase ignora pin de versão em CREATE/ALTER EXTENSION. Registrar versões efetivas; não prometer reprodutibilidade pelo pin de extensão.
4. Templates de email em novos projetos Free com SMTP padrão têm restrições desde 03/06/2026. Validar SMTP transacional próprio e entregabilidade antes de convites/redefinições em produção, sem contratar serviço nesta fase.
5. Peers verificados não substituem build/testes. TypeScript 7 e ESLint 10 não compõem o candidato por incompatibilidades declaradas da cadeia atual.
6. A versão SSR ainda é 0.x; manter pin exato e revisar changelog antes de atualização, com E2E de renovação/logout/expiração.
7. Backup existente no plano não é prova de restauração. Planejar e testar recuperação do Portal antes do go-live; custo/região/RPO/RTO permanecem decisão a registrar.
8. Acesso a repositório não garante permissão de banco nem integração somente leitura. Um client server-side com `service_role` continua privilegiado; a fronteira backend protege o segredo, mas não reduz o alcance da credencial.

## Fontes oficiais consultadas

- [Next.js — instalação, Node, TypeScript, React e lint](https://nextjs.org/docs/app/getting-started/installation)
- [Node — ciclos e versões LTS](https://nodejs.org/en/about/previous-releases); [manifesto de releases e npm incluído](https://nodejs.org/dist/index.json)
- [Registro Next 16.3.8](https://registry.npmjs.org/next/16.3.8), [eslint-config-next 16.3.8](https://registry.npmjs.org/eslint-config-next/16.3.8), [typescript-eslint 8.71.0](https://registry.npmjs.org/typescript-eslint/8.71.0), [eslint-plugin-react 7.37.5](https://registry.npmjs.org/eslint-plugin-react/7.37.5), [eslint-plugin-import 2.32.0](https://registry.npmjs.org/eslint-plugin-import/2.32.0), [eslint-plugin-jsx-a11y 6.10.2](https://registry.npmjs.org/eslint-plugin-jsx-a11y/6.10.2)
- [Registro Supabase JS 2.117.2](https://registry.npmjs.org/@supabase/supabase-js/2.117.2), [SSR 0.12.7](https://registry.npmjs.org/@supabase/ssr/0.12.7), [Vitest 5.0.3](https://registry.npmjs.org/vitest/5.0.3), [Vite 8.3.2](https://registry.npmjs.org/vite/8.3.2), [Playwright 1.63.0](https://registry.npmjs.org/@playwright/test/1.63.0)
- [Supabase — índice de changelog](https://supabase.com/changelog.md), [fim de suporte Node 20](https://supabase.com/changelog/45715-deprecation-notice-dropping-support-for-node-js-20), [PostgreSQL 17.11/15.19](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes), [pin de extensões](https://supabase.com/changelog/extension-version-pinning-ignored), [OrioleDB beta](https://supabase.com/changelog/orioledb-public-beta), [emails em Free](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier)
- [Supabase — SSR Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [funções e privilégios](https://supabase.com/docs/guides/database/functions), [ambientes e migrations](https://supabase.com/docs/guides/deployment/managing-environments)
- [PostgreSQL — locks de linha](https://www.postgresql.org/docs/current/explicit-locking.html)

As propostas de estrutura, atomicidade, menor privilégio e isolamento acima são decisões de arquitetura a validar, não descrições de um sistema já implementado.

