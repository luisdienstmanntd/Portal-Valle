# Decisões de arquitetura

## ADR-009 — Modelo separado e auditoria atômica antes das escritas operacionais

Status: implementada na Fase5, validação SQL/CI pendente. Data: 2026-10-03.

Decisão: experiences/occurrences/bookings locais com capacidades persons/bookings/units/unlimited; limite físico adicional person_limit preserva Cine8pessoas/4puffs. Políticas de crianças/no_show sem default; Lora adiada pelo proprietário. Booking de grupo e guest_bookable false até fluxo público. Auditoria por trigger privada com actor Auth e allowlist de dados estruturados, excluindo PII livre.

Consequências: nenhuma escrita client concedida nesta fase; cálculo puro não garante concorrência. Fase6 deve criar operações autorizadas/atômicas com locks/idempotência antes de qualquer mutação operacional. Sem abstrações genéricas e sem dependência dos legados. Consulte EXPERIENCE_MODEL para reservas/stays/retensão e decisões pendentes.

## ADR-008 — Auth individual e autorização por perfil atual/sessão viva

Status: implementada na Fase 4, validada no CI 37090654113. Data: 2026-10-02.

Decisão: Auth Portal com contas individuais, portal_profiles provisionado administrativamente e permissões centrais no TypeScript/SQL. Perfil ativo e auth.sessions verificados em RLS; papel não vem de metadata editável ou formulário. Lookup definer estreito em private evita recursão e acessa auth.sessions protegida. Configurações segue sem escrita. Proxy renova cookies/headers; guards de página/operação continuam fonte de autorização. Sem configuração somente shell de preparação, nenhuma operação liberada. Hosted permanece adiado pelo proprietário; CI isolado com contas sintéticas.

Consequências: revogação/perfil inativo bloqueia JWT ainda válido; leitura exige banco/Auth disponíveis. Provisionamento real/backup depende do novo SaaS. Consulte AUTH_AND_RBAC e testes para matriz exata.

As decisões abaixo são propostas da Fase 0; status `Proposta` até validação no marco de implementação. Preservar ADRs anteriores; supersedes deve ser adicionado, não apagar histórico.

## ADR-001 — Produto e dados independentes

Status: Aprovada como requisito do proprietário. Data: 2026-10-01.

Contexto: dois sistemas especializados já operam. O Portal agrega a visão da recepção e gere experiências próprias.

Decisão: terceiro repositório/projeto/deploy/Supabase/Auth. Cada domínio retém sua fonte de verdade. Nenhum sistema existente depende do Portal.

Alternativas: monorepo ou migrar bancos existentes; rejeitadas pelo limite explícito e risco operacional.

Consequências: integração gradual e indisponibilidade parcial tratável; custo e configuração separados.

## ADR-002 — Integrações externas somente leitura com privilégio verificável

Status: Aprovada como requisito; mecanismo pendente. Data: 2026-10-01.

Contexto: Facilities concede acesso amplo somente ao service_role; Osteria permite escrita a usuários autenticados. API operacional read-only não foi encontrada no código auditado.

Decisão: adapters server-only, SELECT de colunas e datas mínimas, DTOs próprios, credencial com capacidade técnica de leitura apenas. Habilitação somente após comprovar acesso/contrato. Não modificar bancos externos nesta fase.

Alternativas: service role, conta comum ou importação do cliente legado; rejeitadas por privilégios e efeitos de escrita.

Consequências: Fases 11/12 têm pré-requisito operacional a resolver com autorização específica, sem bloquear o produto de experiências.

## ADR-003 — Programação como projeção de ocorrências

Status: Proposta alinhada ao requisito. Data: 2026-10-01.

Contexto: programação duplicada de eventos pode divergir de reservas e horários.

Decisão: consulta semanal das occurrences reais. Só criar tabela de itens se atributos editoriais concretos exigirem, sempre apontando para occurrence_id.

Alternativas: agenda semanal independente; rejeitada por duplicação.

Consequências: duplicar semana cria novas occurrences sem bookings/presença e exige transação/idempotência.

## ADR-004 — Agenda resiliente e data civil do hotel

Status: Proposta. Data: 2026-10-01.

Contexto: provedores externos podem falhar; fontes armazenam datas/horários de formas distintas.

Decisão: consultar providers em paralelo com timeout e `Promise.allSettled`, distinguir vazio de indisponível; tratar `America/Sao_Paulo` como fuso operacional.

Alternativas: consulta sequencial falhando em cadeia ou depender do timezone da máquina; rejeitadas por risco à recepção.

Consequências: testes de falha parcial, virada de dia, mudança de schema e ordenação por instante.

## ADR-005 — Stack candidata com versões fixas

Status: Implementada e validada na Fase 1, localmente e em CI. Data: 2026-10-01; validação confirmada em 2026-10-02.

Contexto: a referência Facilities usa Next 15; o novo Portal deve ser independente e atual, sem combinar versões incompatíveis.

Decisão: conjunto candidato em `../architecture/STACK_AND_SUPABASE_PLAN.md`, com Node 24 LTS, Next 16, React 19, TypeScript 5, ESLint 9, Tailwind 4. Fixar dependências e lockfile após instalação/testes.

Alternativas: copiar package.json legado inteiro, TS 7/ESLint 10 latest; rejeitadas por dependências desnecessárias/peers incompatíveis.

Consequências: Fase 1 precisa validar `npm ci`, lint, typecheck, testes e build antes de aceitar a decisão como implementada.

## ADR-006 — Projeto Supabase próprio e menor privilégio

Status: Implementada e validada em CI na Fase 3; hospedado adiado pelo proprietário por quota. Data: 2026-10-01; atualização 2026-10-02.

Contexto: Portal armazenará PII de experiências, usuários e auditoria.

Decisão: provisionar Supabase exclusivo do Portal na Fase 3, separado por ambiente conforme custo aprovado; RLS e grants mínimos em schemas expostos; Auth próprio na Fase 4. Chaves privilegiadas fora do fluxo operacional comum.

Alternativas: usar projeto existente ou service role em todas as queries; rejeitadas por acoplamento e excesso de privilégio.

Consequências: definir organização/região/custo/backup antes do provisionamento e testar políticas/concorrência em banco isolado.

Atualização Fase 3: organização luisdienstmanntd, região sa-east-1 e nome Portal-Valle-staging escolhidos; custo consultado US$ 0/mês aprovado, mas criação recusada por quota de dois projetos free. Proprietário escolheu validar em CI e adiar hospedagem. Migration mínima/RLS/grants e testes usam somente stack efêmero do checkout. Nenhuma mudança a legados, plano ou projetos existentes. Auth conectado e backup SaaS permanecem pendentes.

## ADR-007 — Design system mínimo com HTML nativo e assets locais

Status: Implementada na Fase 2. Data: 2026-10-02.

Contexto: a recepção usa desktop/tablet e precisa de controles familiares e navegação por teclado.

Decisão: tokens centrais da referência Facilities, fontes locais Inter/Playfair Display via `next/font/local`, componentes finos de HTML, `<dialog>` modal com nomes acessíveis, Esc/retorno nativos e ciclo explícito de Tab nos controles. Sidebar a partir de 768px; abaixo disso, menu modal. Páginas e layout server; client apenas nas interações.

Alternativas: copiar runtime do sistema existente ou adicionar uma biblioteca completa de UI; não necessárias ao escopo visual desta fase.

Consequências: oito rotas reais com estados de preparação, sem dados/contagens fictícios nem ações de reserva. Fontes possuem cópia da licença OFL e SHA documentados. Formulários e confirmações operacionais precisarão de validações/testes nas respectivas fases.

