# Arquitetura

## Estado atual

Portal-Valle contém a fundação Next.js App Router, design system em `src/components/ui`, estrutura de navegação em `src/components/shell`, oito rotas e estados de preparação. `/` redireciona para `/hoje`. Layout e páginas são Server Components; navegação ativa, menu mobile e diálogos têm interações client. Fontes e logo são locais. Fase 3 adiciona migration mínima `portal_settings` com RLS/default deny, configuração de identidade e clientes Supabase browser/server de leitura, ainda não usados nas páginas. Banco de validação é efêmero em CI; Supabase hospedado adiado por quota conforme escolha do proprietário. Fase 4 implementa Auth individual e RBAC por perfil ativo/sessão viva, validados no CI 37090654113; hosted/equipe real permanecem desconectados. Login/logout, proxy SSR, guards em cada página e matriz can central estão em AUTH_AND_RBAC. Fase5 adiciona modelo experiences/occurrences/bookings/audit, domínio puro e mapper, em validação CI; sem escrita client/RPC/UI operacional. Ainda não há experiências operacionais ou adapters. As arquiteturas externas estão em `../architecture/FACILITIES_AUDIT.md` e `../architecture/OSTERIA_AUDIT.md`. Código em main dos sistemas externos não prova qual commit está em produção.

## Arquitetura alvo

```mermaid
flowchart TD
  User[Recepção desktop e tablet] --> UI[Portal Next.js App Router]
  UI --> App[Casos de uso e autorização]
  App --> Domain[Domínio puro de experiências e agenda]
  App --> PortalDB[Supabase exclusivo do Portal]
  PortalDB --> Auth[Supabase Auth exclusivo do Portal]
  App --> F[Adapter Facilities no servidor]
  App --> O[Adapter Osteria no servidor]
  F -->|somente leitura| FDB[Banco Piscina e Academia]
  O -->|somente leitura| ODB[Banco Osteria]
  ExistingF[Sistema Piscina e Academia] --> FDB
  ExistingO[Sistema Osteria] --> ODB
```

Nenhuma seta dos sistemas existentes para o Portal. Sem foreign keys entre projetos, autenticação compartilhada, hotlink de logo, importação de código externo ou sincronização permanente de hóspedes.

## Organização progressiva

Next.js App Router/React/TypeScript strict; componentes de servidor para carga inicial. Cliente somente para interação. Domínio não importa React, Next, Supabase, DOM ou browser APIs. Casos de uso pequenos recebem dependências explícitas onde agregação, testes ou substituição do provider justificarem um port.

Estrutura alvo, criada apenas à medida que cada fase usar os caminhos:

```text
src/
  app/                       # rotas, boundaries, actions
  components/                # UI comum do Portal
  modules/
    experiences/{domain,application,infrastructure,ui}/
    weekly-program/{domain,application,ui}/
    agenda/{domain,application,ui}/
    auth/{domain,application,infrastructure}/
  integrations/{facilities,osteria}/
  lib/                       # tempo do hotel, ENV, erros, logs
supabase/migrations/
supabase/seed.sql             # apenas dados fictícios de desenvolvimento
tests/{integration,e2e}/
public/brand/
docs/{ai,architecture}/
```

Stays só na Fase 15. `weekly-program/infrastructure` só se surgir persistência própria justificada; na primeira versão a semana consulta occurrences. Não criar diretórios vazios nesta fase.

## Dados e regras

Portal é fonte de verdade de experiências, occurrences, inscrições, usuários próprios, configurações e auditoria. Capacidade usa persons/bookings/units/unlimited; nunca renderizar um denominador sem unidade. Todas as entradas importantes passam por validação no servidor, autorização central e invariantes SQL.

Transações de reserva devem serializar a capacidade por occurrence, verificar novamente disponibilidade e autorização, aplicar idempotência e inserir auditoria na mesma transação. Edição de quantidade, mudança de occurrence, cancelamento/restauração e redução de capacidade precisam da mesma proteção. Chamadas diretas à tabela não podem contornar essas regras. Desenho SQL exato será validado nas Fases 3/5/6.

## Agenda e falhas

`GetDailyAgenda(LocalDate)` agrega providers independentes via `Promise.allSettled`, cada um com timeout finito e consulta limitada ao dia. Retorna entries ordenadas, status por fonte, fetchedAt e erro normalizado. IDs compostos `source:id` evitam colisões; unknown, unavailable e empty são estados distintos. Não inventar zero reservas quando uma integração falhar.

UI parcial continua utilizável. Não transmitir erros SQL/stack traces ao browser. Cada integração valida payload e traduz seu schema para DTO Portal. Nenhuma importação do boot/listeners Osteria: eles podem escrever mesmo durante ações aparentemente de leitura.

## Tempo e cache

Timezone do hotel: America/Sao_Paulo. `LocalDate` validada YYYY-MM-DD representa um dia do hotel; instantes usam UTC/timestamptz. Consultas de instante usam intervalo semiaberto [início do dia, início do próximo dia), convertido com timezone, inclusive quando servidor/navegador estiverem em outro fuso. Integrações que armazenam date + time recebem tradução explícita.

Agenda e ocupação: carga inicial `no-store` no servidor e refresh após mutações; sem cache compartilhado contendo PII. Catálogo estático pode receber revalidação explícita posteriormente. Realtime não será adicionado automaticamente; demonstrar benefício antes. Nenhuma biblioteca de estado global.

## Autenticação e segurança

Supabase Auth próprio. Política `can(user, permission)` central com matriz explícita e equivalente no banco. Perfil ativo/revogação verificados no servidor; nunca confiar em role recebido no formulário ou user_metadata editável. RLS habilitada e grants mínimos; sem acesso anônimo a dados internos. Chave pública com sessão do usuário é caminho normal, chave privilegiada não é requisito universal.

Integrações: servidor → acesso comprovadamente restrito → banco externo. As permissões hoje observadas não satisfazem isso automaticamente. Qualquer novo role/view/RPC no externo depende de autorização específica futura. Até lá, provider desativado e link ao sistema de origem.

Auditoria registra actor, entidade, ação, campos relevantes e horário; não snapshots irrestritos de PII. Logs estruturados com requestId, duração e errorCode. Segredos nunca com NEXT_PUBLIC_. Política de retenção/anonimização precisa de decisão do hotel antes de dados reais.
