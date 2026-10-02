# Decisões de arquitetura

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

Status: Proposta, sujeita aos gates da Fase 1. Data: 2026-10-01.

Contexto: a referência Facilities usa Next 15; o novo Portal deve ser independente e atual, sem combinar versões incompatíveis.

Decisão: conjunto candidato em `../architecture/STACK_AND_SUPABASE_PLAN.md`, com Node 24 LTS, Next 16, React 19, TypeScript 5, ESLint 9, Tailwind 4. Fixar dependências e lockfile após instalação/testes.

Alternativas: copiar package.json legado inteiro, TS 7/ESLint 10 latest; rejeitadas por dependências desnecessárias/peers incompatíveis.

Consequências: Fase 1 precisa validar `npm ci`, lint, typecheck, testes e build antes de aceitar a decisão como implementada.

## ADR-006 — Projeto Supabase próprio e menor privilégio

Status: Proposta; nenhum projeto criado. Data: 2026-10-01.

Contexto: Portal armazenará PII de experiências, usuários e auditoria.

Decisão: provisionar Supabase exclusivo do Portal na Fase 3, separado por ambiente conforme custo aprovado; RLS e grants mínimos em schemas expostos; Auth próprio na Fase 4. Chaves privilegiadas fora do fluxo operacional comum.

Alternativas: usar projeto existente ou service role em todas as queries; rejeitadas por acoplamento e excesso de privilégio.

Consequências: definir organização/região/custo/backup antes do provisionamento e testar políticas/concorrência em banco isolado.

