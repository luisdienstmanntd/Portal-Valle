# FASE 0 CONCLUÍDA — descoberta e planejamento

Data: 2026-10-01. Escopo exclusivo da Fase 0. As fontes foram repositórios GitHub em commits fixos e catálogos PostgreSQL em consultas somente leitura. Nenhuma feature, banco novo, migration, deploy, escrita externa ou teste de aplicação foi executado.

## Sistemas analisados

- [Piscina/Academia](FACILITIES_AUDIT.md): `luisdienstmanntd/Reservas-Piscina-Academia`, commit `eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0` de 30/09/2026.
- [Osteria](OSTERIA_AUDIT.md): `luisdienstmanntd/Gerenciador-de-Reservas`, commit `42638d06eef9f694df4742aa29ce8c3f71d6a6e8` de 17/07/2026.
- [Novo repositório](https://github.com/luisdienstmanntd/Portal-Valle): criado pelo proprietário, vazio ao início desta documentação, público e independente. A publicação dos documentos detalhados foi autorizada após a conclusão da Fase 0. Ver commits em `docs/ai/PROGRESS.md`.

## Arquitetura encontrada

Facilities: Next.js App Router/React/TS, Server Actions, Supabase administrativo server-side, Auth operacional próprio da recepção e tokens de estadia. Osteria: aplicação estática JavaScript ESM, Supabase Auth/Postgres/Realtime e Firebase Hosting; inicialização/listeners têm efeitos de escrita. Ambas são sistemas operacionais válidos; nenhuma arquitetura será transplantada por importação runtime. Detalhes e limites de deploy estão nas auditorias.

## Identidade visual encontrada

Paleta creme `#f9f7f2`, castanho `#604d3f`, carvão `#2d2926`, acentos cinza-azulados; Inter + Playfair Display, cards e controles discretos, raio base `0.625rem`. [Mapa visual](VISUAL_IDENTITY.md).

## Assets encontrados

Logo em uso `public/logo-valle-dincanto.jpg` (1024×364), alternativa `public/brand/logo-header.png` (354×140) e duas variantes PNG idênticas no snapshot. A cópia para `public/brand/` do Portal é tarefa da Fase 1.

## Bancos encontrados

Facilities: projeto Supabase homônimo na conta, tabelas `reservations` e `active_stays`, RLS ativa sem policies e grants somente à service_role. Associação do deploy ao ref exato ainda não comprovada. Osteria: projeto `fiamtckdglzdrynmrlpj` confirmado pelo código, oito tabelas públicas e quatro views; RLS ampla para qualquer sessão autenticada nas tabelas operacionais. Migrations Git e histórico remoto divergem. [Evidência de catálogos](DB_CATALOG_EVIDENCE.md).

## Integrações possíveis

Agenda Facilities por data/instalação e Osteria por data/hora, com DTOs reduzidos, adapters exclusivos do servidor e estado de erro por fonte. Não há credencial tecnicamente read-only comprovada em nenhum dos dois. Ambas ficam desabilitadas até resolver autenticação/contrato em fases futuras autorizadas. [Plano de integrações](../ai/INTEGRATIONS.md).

## Riscos

Excesso de privilégio nas credenciais existentes, dados pessoais/financeiros em views Osteria, efeitos de escrita ao inicializar código legado, data/hora local, drift Git/banco, configuração de deploy desconhecida e política LGPD/capacidade por confirmar. [Registro vivo](../ai/KNOWN_ISSUES.md).

## Arquitetura proposta para Portal-Valle

Terceiro produto Next.js, Supabase/Auth próprios; domínio de experiências, occurrences e bookings; semana derivada das occurrences; agenda com providers independentes e falha parcial; autorização central/RLS, validação server-side, capacidade transacional e auditoria. Fuso America/Sao_Paulo. Sistemas existentes continuam independentes. [Arquitetura e diagrama](../ai/ARCHITECTURE.md); [decisões](../ai/DECISIONS.md).

## Estrutura proposta

`src/app`, `src/components`, `src/modules/{experiences,weekly-program,agenda,auth}`, `src/integrations/{facilities,osteria}`, `src/lib`, `supabase/migrations`, `tests/{integration,e2e}`, `public/brand`, `docs/{ai,architecture}`. Criar pastas apenas quando a fase usar; nenhum diretório de feature vazio criado agora.

## Stack proposta

Node 24 LTS, Next 16.3.8, React 19.3, TypeScript 5.9 strict, ESLint 9, Tailwind 4, Supabase JS/SSR na fase apropriada, Zod, Vitest, Playwright, date-fns e ícones/feedback leves. Versões exatas/peers e critérios de verificação em [STACK_AND_SUPABASE_PLAN](STACK_AND_SUPABASE_PLAN.md). São **candidatas pesquisadas**, não instaladas/testadas.

## Documentação criada

`README.md`, `AGENTS.md`, pedido original, `PROJECT_CONTEXT`, `ARCHITECTURE`, `DOMAIN_MODEL`, `DECISIONS`, `PROGRESS`, `CHANGELOG_AI`, `KNOWN_ISSUES`, `TEST_MATRIX`, `INTEGRATIONS`, duas auditorias, catálogos, identidade visual e plano de stack/Supabase. A revisão automática bloqueou o primeiro envio ao repositório público; a publicação foi autorizada expressamente pelo proprietário em seguida.

## Banco

Plano de novo projeto Supabase Portal por ambiente, com Auth próprio, RLS e migrations locais versionadas. Organização/região/custo/backup antes do provisionamento. **Nenhum projeto Supabase Portal criado nesta fase.**

## Testes executados e resultado

Aplicação ainda inexistente: lint/typecheck/unit/integration/E2E/build **não executados e não aplicáveis**. Auditoria de código e catálogos read-only concluída. Arquivos, links locais, varredura de padrões de segredo e diff Git conferidos. Não afirmar verde de testes não executados.

## Próxima fase

Fase 1: fundação independente do novo projeto, CI e design tokens/logo, sem feature operacional ou integração externa. Criar ambiente Supabase somente na Fase 3. Não iniciar Fase 1 automaticamente.

## Validação manual sugerida

Abrir este relatório e as duas auditorias, conferir que [Portal-Valle](https://github.com/luisdienstmanntd/Portal-Valle) é repositório separado, revisar a identidade visual e decidir na Fase 1 se o logo em uso deve ser copiado como JPG ou substituído por variante PNG. Antes das fases de integração, confirmar com responsáveis uma interface de leitura restrita.

## Autorização subsequente

**Fase 1 autorizada posteriormente pelo proprietário.**

