# Decisões de arquitetura

## ADR-010 — Cine primeiro e operações transacionais por sessão

Status: implementada e APROVADO TECNICAMENTE na Fase6 adaptada, CI37155203841 PASS. Data: 2026-10-03.

Proprietário adiou Lora, autorizou Cine8pessoas/4puffs e informou não haver lugares para crianças. Reordenar primeiro fluxo para Cine sem declarar Lora implementada. Puffs provisoriamente exclusivos por inscrição, ceil(adults/2), suposição comunicada enquanto resposta sobre compartilhamento está pendente.

RPCs por usuário vivo, locks catálogo→sessão→inscrição, versões/conflitos, idempotência actor/request/hash e auditoria transacional. Recepção gerencia bookings; gerência/admin também gerenciam sessões. Crianças/unidades inválidas recusadas no SQL. Cancelamento preserva presença/histórico; no_show bloqueia escritas de capacidade até política; transferência fora do fluxo. Ver CINEMA_OPERATIONS. Hosted adiado.

## ADR-009 — Modelo separado e auditoria atômica antes das escritas operacionais

Status: implementada na Fase5, validada no CI37151730319. Data: 2026-10-03.

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


## ADR-011 — Reutilização de experiências e vagas por adultos

Status: implementada e validada na Fase 8 (CI37158542094 PASS). Data: 2026-10-03.

O proprietário confirmou crianças somente em observações para Cine/Lora/Pizza e capacidade inicial 12 para Lora/Pizza. O campo de admissão children_allowed foi removido; children=0 é invariante técnica, não proibição de participação. Capacidade conta adultos. Lora permanece adiada.

Cine e Pizza usam consultas, formulários e Server Actions compartilhados, com configuração fechada cinema/pizza. Helpers privados SECURITY INVOKER são chamados por wrappers SECURITY DEFINER com search_path vazio, grants mínimos e autorização viva. Wrappers restringem categoria e slug; idempotência inclui categoria, slug e tipo de operação antes de qualquer replay. persons exige units=0; Cine calcula ceil(adults/2). Auditoria exclui observações e dados pessoais. Sem motor universal ou financeiro.

## ADR-012 — Semana como projeção e cópias em rascunho

Status: implementada e validada no CI37168649494 PASS. Data:2026-10-03.

Semana começa segunda no fuso do hotel, intervalo semiaberto por starts_at. Eventos noturnos ficam no dia inicial. Duplicação não sobrescreve destino: qualquer sessão, inclusive cancelada, bloqueia; fonte vazia bloqueia. Apenas Cine/Pizza ativos com draft/published são copiados; novos rascunhos/version1/operador atual, sem bookings. Preserve hora local na mudança de offset, rejeite gap impossível. Registro privado guarda IDs do lote para replay determinístico; advisory global antes de locks comuns serializa duplicação e writers de sessões. Baixo volume operacional justifica serialização simples, sem motor universal/recorrência.

## ADR-013 — Agenda como projeção de sessões com estados de fonte

Status: implementada e validada na Fase 10, CI37170139071 PASS. Data: 2026-10-03.

A agenda inicial usa apenas occurrences próprias Cine/Pizza. DTO exclui hóspedes e contagens; navegação leva ao detalhe autorizado. Fontes desconectadas, falhas e consulta vazia têm estados distintos; desconhecimento nunca vira ausência. allSettled, timeout e abort limitam falha por fonte. Limites civis do hotel suportam meia-noite histórica inexistente; sessões pertencem ao dia inicial. Nenhuma materialização de agenda, integração externa ou nova permissão.

ADR-013 validada: CI37170139071/c639381de43eb842e955f54242965817794f68b2 PASS: 97 unitários, 40 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints Agenda/Cine/Pizza/semana, advisors e cleanup PASS.

## ADR-014 — Facilities preparado, sem conexão administrativa

Metadados autorizados continuam sem interface SELECT-only comprovada. Factory null incondicional, sem ENV habilitadora. Port estrito de leitura/DTO sem PII/complete=true e fixtures permitem preparar contrato e telas sem ler dados externos. Não confundir preparação tecnicamente validada com integração operacional concluída.

## ADR-015 — Osteria preparada com tradução mínima, sem conexão ampla

Paxs/chd vêm da origem; regra de observações de crianças do Cine/Pizza não altera Osteria. DTO exclui identidade/financeiro; tipo vem somente de join mínimo. Linhas vazias/bloqueios fora, canceladas distintas sem somar ativos. Horário civil com segundos, mesa textual, nenhuma duração ou disponibilidade inferida. Factory null até SELECT-only e contrato da fonte verificados. Preparação não significa integração operacional concluída.

## ADR-016 — Home compõe contratos mínimos existentes

Fase13 usa agenda própria e leitores diários validados em paralelo, sem duplicar transporte/schema nem ampliar DTO da Agenda inicial. Resumos com unidades explícitas e nulidade desconhecida; timeline sem PII. Integrações preparadas permanecem desconectadas. Guard por domínio antes da carga; próxima consultada exclui rascunhos/concluídas/canceladas. Disponibilidade parcial nunca implica dia vazio.
