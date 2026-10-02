# PORTAL VALLE D'INCANTO
## Prompt Mestre de Arquitetura, Desenvolvimento, Qualidade e Continuidade para Codex

Você atuará como ENGENHEIRO DE SOFTWARE SÊNIOR FULL-STACK responsável por criar um NOVO sistema operacional para o Hotel Valle D'Incanto, em Gramado-RS.

O sistema será usado em ambiente real pela recepção e, futuramente, poderá integrar outros setores e hóspedes.

Este não é um projeto demonstrativo.

A prioridade é criar software:

- simples;
- confiável;
- seguro;
- testável;
- fácil de manter;
- preparado para evolução;
- resistente a regressões;
- com arquitetura clara;
- com excelente experiência em desktop e tablet.

Princípio central:

> Código bom é código que não precisou ser escrito.

Antes de criar função, abstração, componente, biblioteca, tabela ou serviço, verificar se existe uma solução mais simples.

Evitar duplicação.
Evitar abstração prematura.
Evitar dependências desnecessárias.
Evitar complexidade acidental.

---

# 1. IDENTIDADE DO NOVO PROJETO

Criar um NOVO projeto totalmente independente.

Repositório GitHub:

luisdienstmanntd/Portal-Valle

Deploy de produção desejado:

https://portalvalle.vercel.app

Nome do produto:

# Valle D'Incanto — Portal de Experiências

Nome curto na interface:

# Portal Valle

O projeto deve possuir:

- repositório próprio;
- deploy próprio;
- projeto Vercel próprio;
- Supabase próprio;
- migrations próprias;
- CI próprio;
- autenticação própria;
- variáveis de ambiente próprias;
- documentação própria;
- testes próprios.

---

# 2. REGRA CRÍTICA — SISTEMAS EXISTENTES NÃO PODEM SER SOBRESCRITOS

Existem hoje dois sistemas independentes em produção.

## Sistema A

Repositório:

luisdienstmanntd/Reservas-Piscina-Academia

Função:

reservas de piscina e academia.

## Sistema B

Repositório:

luisdienstmanntd/Gerenciador-de-Reservas

Produção:

https://osteriadilucca.web.app/

Função:

gestão operacional da Osteria Di Lucca.

Inclui:

- reservas;
- hóspedes/clientes;
- mesas;
- cronômetros;
- bloqueios;
- room service;
- logs;
- notificações;
- dashboard;
- gestão do salão;
- autenticação.

---

# 3. PROIBIÇÕES ABSOLUTAS

É PROIBIDO alterar qualquer comportamento desses dois sistemas sem autorização explícita do proprietário.

Não:

- criar o Portal dentro deles;
- usar branch deles para desenvolver o Portal;
- alterar seus deploys;
- substituir seus domínios;
- alterar suas migrations;
- migrar seus bancos;
- alterar suas credenciais;
- alterar autenticação;
- remover funcionalidades;
- modificar regras;
- fazer refactor nesses projetos apenas para facilitar o Portal;
- fazer deploy do Portal em URLs existentes;
- fazer escrita nos bancos deles nas primeiras fases.

Eles devem continuar funcionando mesmo que o Portal Valle esteja completamente fora do ar.

Princípio arquitetural obrigatório:

> O Portal Valle agrega sistemas existentes. Os sistemas existentes nunca devem depender do Portal Valle para continuar funcionando.

---

# 4. PAPEL DOS SISTEMAS EXISTENTES

Eles serão considerados SISTEMAS EXTERNOS.

Inicialmente:

Portal Valle
    |
    +-- consulta Piscina/Academia
    |
    +-- consulta Osteria
    |
    +-- gerencia suas próprias experiências

As primeiras integrações com sistemas existentes devem ser READ-ONLY.

Operações de escrita serão avaliadas somente futuramente e somente após autorização explícita.

---

# 5. OBJETIVO DO PORTAL

Hoje o hotel utiliza diferentes sistemas e planilhas para controlar experiências e operações.

O Portal Valle deverá centralizar a VISÃO da recepção.

O usuário deverá conseguir abrir uma única aplicação e visualizar:

- programação do dia;
- programação semanal;
- piscina;
- academia;
- Osteria Di Lucca;
- Lora del Vino;
- Cine Toscana;
- La Vera Pizza;
- outras experiências futuras;
- reservas;
- capacidade;
- hóspedes participantes;
- apartamentos;
- responsáveis;
- presença;
- observações;
- disponibilidade.

O Portal substituirá gradualmente as planilhas usadas para experiências.

Não substituirá os sistemas especializados existentes.

---

# 6. IDENTIDADE VISUAL

O Portal Valle deve seguir a mesma linguagem visual do projeto:

luisdienstmanntd/Reservas-Piscina-Academia

Utilizar como referência:

- cores;
- tipografia;
- espaçamentos;
- cards;
- botões;
- bordas;
- inputs;
- tabelas;
- badges;
- modais;
- ícones;
- comportamento responsivo;
- aparência elegante e discreta;
- identidade do Hotel Valle D'Incanto.

Também usar o LOGOTIPO OFICIAL do hotel já utilizado nos projetos existentes.

IMPORTANTE:

Pode copiar ativos visuais necessários para o NOVO repositório.

Não criar dependência runtime entre os repositórios.

O Portal precisa continuar funcionando mesmo que o repositório antigo mude ou seja removido.

Não importar componentes diretamente de outro repositório.

Analisar, reaproveitar conceitos e, quando fizer sentido, portar componentes conscientemente.

---

# 7. ESTILO DO PRODUTO

A aparência deve transmitir:

- hotelaria de alto padrão;
- elegância;
- simplicidade;
- clareza;
- baixa poluição visual;
- rapidez operacional.

Evitar aparência de sistema administrativo genérico.

Evitar:

- excesso de cores;
- dashboards carregados;
- dezenas de gráficos na home;
- excesso de sombras;
- animações desnecessárias;
- componentes chamativos sem função operacional.

O usuário principal é a RECEPÇÃO.

Objetivo da interface:

> permitir entender o que está acontecendo no hotel em menos de 5 segundos.

---

# 8. STACK TÉCNICA

Usar como base conceitual a stack moderna do sistema Piscina/Academia.

Preferência:

- Next.js App Router;
- React;
- TypeScript strict;
- Tailwind CSS;
- Supabase/PostgreSQL;
- Supabase Auth;
- Zod;
- Vitest;
- Playwright;
- date-fns;
- lucide-react;
- Sonner ou equivalente já utilizado;
- componentes UI reutilizáveis.

Antes de adicionar biblioteca:

1. justificar necessidade;
2. verificar se Next.js/React/CSS/Zod/date-fns já resolvem;
3. analisar peso;
4. registrar decisão se relevante.

Não introduzir sem justificativa:

- Redux;
- MobX;
- GraphQL;
- tRPC;
- microservices;
- Kafka;
- event bus;
- ORM complexo;
- state manager global.

---

# 9. ARQUITETURA MACRO

Arquitetura inicial:

                    PORTAL VALLE
                       Next.js
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
      Portal DB      Piscina/Academia    Osteria
       Supabase       sistema externo    sistema externo
          |               |               |
          |           READ ONLY       READ ONLY
          |
          +-- Lora del Vino
          +-- Cine Toscana
          +-- La Vera Pizza
          +-- Programação semanal
          +-- Usuários Portal
          +-- Auditoria Portal
          +-- Configurações Portal

Cada domínio permanece dono dos seus dados.

---

# 10. SOURCE OF TRUTH

Definir claramente:

Piscina/Academia:
banco atual do sistema Piscina/Academia.

Osteria:
banco atual da Osteria.

Experiências:
Supabase próprio do Portal Valle.

Usuários Portal:
Supabase Auth do Portal.

Programação semanal:
Portal Valle.

Nunca duplicar permanentemente dados somente para facilitar a interface.

---

# 11. PROJETO SUPABASE

Criar NOVO projeto Supabase exclusivamente para o Portal Valle.

Não reutilizar projeto de Piscina/Academia.

Não reutilizar projeto da Osteria.

Esse novo banco deverá armazenar apenas dados pertencentes ao Portal.

---

# 12. ESTRUTURA DO REPOSITÓRIO

Estrutura inicial aproximada:

Portal-Valle/

  src/
    app/
    components/
    modules/
    integrations/
    lib/

  supabase/
    migrations/
    seed.sql ou equivalente de desenvolvimento

  tests/
    integration/
    e2e/

  docs/
    ai/
    architecture/

  public/
    brand/

  AGENTS.md
  README.md
  package.json
  tsconfig.json

Não criar dezenas de diretórios vazios.

Criar módulos conforme forem necessários.

---

# 13. ARQUITETURA INTERNA

Preferir organização por domínio.

Exemplo:

src/modules/

  experiences/
    domain/
    application/
    infrastructure/
    ui/

  weekly-program/
    domain/
    application/
    infrastructure/
    ui/

  agenda/
    domain/
    application/
    ui/

  stays/
    domain/
    application/

  auth/
    domain/
    application/
    infrastructure/

Separar integrações externas:

src/integrations/

  facilities/
  osteria/

---

# 14. REGRA DE DEPENDÊNCIA

Preferir:

UI
↓
Application
↓
Domain
↓
Ports

Infrastructure implementa ports.

O domínio NÃO deve depender diretamente de:

- React;
- Next.js;
- Supabase;
- DOM;
- browser APIs.

Regras críticas devem poder ser testadas sem banco e sem navegador.

---

# 15. NÃO FAZER CLEAN ARCHITECTURE CERIMONIAL

Separação de responsabilidades é obrigatória.

Cerimônia não.

Não criar:

- 5 interfaces para uma função simples;
- factories desnecessárias;
- dependency injection framework;
- BaseRepository;
- GenericService;
- UniversalCRUD.

Abstrair apenas onde existe benefício real.

---

# 16. RESULTADOS E ERROS

Padronizar operações importantes.

Exemplo:

type Result<T, E> =
  | { ok: true; data: T }
  | { ok: false; error: E };

Erros internos estáveis:

UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
CAPACITY_EXCEEDED
INTEGRATION_UNAVAILABLE
DATABASE_ERROR

A interface não deve receber diretamente erros PostgreSQL ou stack traces.

Separar:

erro técnico

de:

mensagem para usuário.

---

# 17. EXPERIÊNCIAS DO HOTEL

O Portal deverá suportar inicialmente:

## Lora del Vino

Degustação de vinhos realizada no hotel por vinícolas da região.

Características:

- evento em data e horário;
- uma mesa compartilhada;
- queijos e frios como gentileza;
- limite de participantes;
- hóspedes inscritos;
- apartamento;
- adultos;
- crianças quando necessário;
- responsável;
- presença;
- observações.

## Cine Toscana

Cinema no jardim ou taverna.

Características:

- evento;
- horário;
- filme;
- local;
- puffs/capacidade;
- reserva por casal/grupo;
- hóspede;
- apartamento;
- número de pessoas;
- responsável;
- presença.

## La Vera Pizza

Noite de pizza napolitana na taverna.

Características:

- evento;
- data;
- horário;
- local;
- capacidade;
- hóspedes;
- apartamentos;
- pessoas;
- observação.

Não implementar financeiro complexo inicialmente.

---

# 18. EXPERIÊNCIAS FUTURAS

O sistema deve permitir cadastrar novas experiências sem criar nova aplicação.

Não codificar:

if experience === "lora"
if experience === "cine"

em toda a aplicação.

Utilizar configuração e regras por domínio.

Ao mesmo tempo:

não tentar criar motor universal para qualquer evento imaginável.

Atender o domínio real do hotel.

---

# 19. MODELO EXPERIENCE

Tabela conceitual:

experiences

id
slug
name
description
category
booking_mode
capacity_mode
default_capacity
active
guest_bookable
created_at
updated_at

Possíveis categorias:

wine
cinema
gastronomy
wellness
leisure
other

---

# 20. EXPERIENCE OCCURRENCE

Uma experiência é o conceito.

Occurrence é sua realização.

Exemplo:

Experience:
Lora del Vino

Occurrence:
08/10/2026 às 18:00

Campos:

id
experience_id
starts_at
ends_at
location
capacity_override
status
title_override
description_override
metadata
created_at
updated_at

Status:

draft
published
cancelled
completed

---

# 21. BOOKINGS

Tabela conceitual:

experience_bookings

id
occurrence_id
stay_id nullable
apartment_number
guest_name
guest_phone nullable
adults
children
units
notes
status
attendance_status
created_by
created_at
updated_at

Status:

reserved
confirmed
cancelled
no_show

Attendance:

pending
present
absent

---

# 22. CAPACIDADE

Experiências podem controlar capacidade por:

persons
bookings
units
unlimited

Exemplos:

Lora:
persons

Cine:
units ou bookings

Não assumir que toda capacidade significa pessoas.

---

# 23. PROGRAMAÇÃO SEMANAL

O hotel possui programação semanal de lazer.

Criar módulo específico:

Weekly Program

Objetivo:

permitir visualizar e organizar as experiências da semana.

Exemplo:

SEGUNDA
—

TERÇA
19:30 Cine Toscana

QUARTA
20:00 La Vera Pizza

QUINTA
18:00 Lora del Vino

SEXTA
19:30 Cine Toscana

SÁBADO
20:00 La Vera Pizza

DOMINGO
—

---

# 24. REGRA DA PROGRAMAÇÃO

Programação semanal não deve duplicar eventos.

Fluxo:

Experience
↓
Occurrence
↓
Weekly Program

O item da programação aponta para uma occurrence real.

---

# 25. DUPLICAR SEMANA

Permitir futuramente:

"Duplicar programação da semana anterior"

Mas:

- pedir confirmação;
- criar novas occurrences;
- NÃO copiar reservas;
- nunca copiar presença;
- recalcular datas corretamente.

Cobrir com testes.

---

# 26. HOME PRINCIPAL — HOJE

A principal tela da recepção será:

# Hoje

Mostrar:

data;
dia da semana;
próximas atividades;
resumo de ocupação;
timeline diária.

Exemplo:

08:00
Academia
Apto 311

14:00
Piscina
Apto 205

18:00
Lora del Vino
8 / 12

19:30
Cine Toscana
3 / 4

20:00
Osteria
7 reservas / 18 pessoas

---

# 27. CARD DE CADA ÁREA

Home pode mostrar:

Piscina
Academia
Osteria
Experiências

Cada card apresenta apenas informação operacional útil.

Não transformar Home em BI.

---

# 28. AGENDA UNIFICADA

Criar aplicação:

GetDailyAgenda

Ela agrega diferentes providers.

Contrato conceitual:

interface AgendaProvider {
  getEntries(date: LocalDate): Promise<AgendaEntry[]>
}

AgendaEntry:

id
source
type
title
start
end
guest
apartment
persons
status
href
metadata

Providers iniciais:

ExperienceAgendaProvider
FacilityAgendaProvider
OsteriaAgendaProvider

---

# 29. AGREGAÇÃO RESILIENTE

Providers independentes devem executar em paralelo.

Preferir:

Promise.allSettled

Se Osteria estiver indisponível:

Experiências continuam.

Piscina continua.

Academia continua.

Mostrar:

"Osteria temporariamente indisponível."

Nunca derrubar a Home inteira.

---

# 30. INTEGRAÇÃO PISCINA/ACADEMIA

Criar adapter isolado.

Exemplo:

src/integrations/facilities/

  facilities-client.server.ts
  facilities-repository.ts
  facilities-mapper.ts
  facilities-types.ts

Inicialmente:

READ ONLY.

Funções possíveis:

getFacilityReservationsByDate()

getFacilityDailySummary()

A UI não acessa diretamente o banco externo.

---

# 31. INTEGRAÇÃO OSTERIA

Criar adapter:

src/integrations/osteria/

  osteria-client.server.ts
  osteria-repository.ts
  osteria-mapper.ts
  osteria-types.ts

Inicialmente:

READ ONLY.

Funções:

getOsteriaReservationsByDate()

getOsteriaDailySummary()

---

# 32. ANTI-CORRUPTION LAYER OSTERIA

O Portal não deve conhecer detalhes internos como:

original_base
posicao
metadados específicos da grade

Esses dados pertencem ao Gerenciador da Osteria.

Adapter traduz:

schema Osteria
↓
DTO Portal

Exemplo:

OsteriaReservationSummary

id
date
time
guestName
apartment
adults
children
table
customerType
paymentStatus
notes

---

# 33. ESCRITA NOS SISTEMAS EXTERNOS

NÃO implementar inicialmente.

Primeiro:

READ ONLY.

Somente em uma fase futura, após autorização explícita, analisar:

- criação;
- edição;
- cancelamento.

Antes disso produzir:

OSTERIA_WRITE_ANALYSIS.md

e

FACILITIES_WRITE_ANALYSIS.md

Mapear invariantes antes de qualquer escrita.

---

# 34. REGRA DE SEGURANÇA DAS INTEGRAÇÕES

Nunca expor credenciais privilegiadas no browser.

Fluxo obrigatório:

Browser
↓
Portal Next.js
↓
adapter server-side
↓
sistema externo

Nunca:

Browser
↓
service role

---

# 35. PRINCÍPIO DE LEAST PRIVILEGE

Não assumir que service role é a solução definitiva.

Na Fase de Integração:

investigar acesso read-only.

Preferir:

- views específicas;
- RPC read-only;
- usuário/role limitado;
- políticas adequadas.

Não alterar banco externo sem autorização.

---

# 36. AUTH DO PORTAL

O Portal deverá possuir autenticação própria.

Preferência:

Supabase Auth.

Perfis iniciais:

recepcao
gerencia
admin

Futuramente:

lazer
osteria

---

# 37. AUTORIZAÇÃO

Não espalhar:

if (role === "...")

Criar política central.

Exemplo:

can(user, "experiences.manage")

Permissões possíveis:

portal.read
experiences.read
experiences.manage
weekly_program.manage
facilities.read
osteria.read
reports.read
settings.manage

---

# 38. AUDITORIA

Alterações realizadas no Portal devem gerar log.

audit_events

id
actor_id
action
entity_type
entity_id
before
after
created_at

Não registrar:

- senhas;
- access tokens;
- service roles.

---

# 39. DATA E HORÁRIO

Timezone operacional:

America/Sao_Paulo

Centralizar helpers.

Não espalhar:

new Date()

pela aplicação para definir "dia do hotel".

Criar helpers testados para:

- data atual do hotel;
- início/fim do dia;
- horários;
- virada da meia-noite;
- serialização;
- formatação.

---

# 40. CONCORRÊNCIA

Capacidade não pode depender apenas de:

SELECT
if available
INSERT

Invariantes críticas devem ser protegidas no banco.

Quando necessário:

- constraint;
- transaction;
- RPC;
- locking.

Criar teste de concorrência.

---

# 41. IDEMPOTÊNCIA

Evitar reservas duplicadas causadas por:

- duplo clique;
- retry;
- refresh;
- latência.

Botão de submit deve bloquear enquanto operação estiver pendente.

Operações críticas podem usar idempotency key.

---

# 42. DESIGN SYSTEM

Criar Design System mínimo próprio do Portal.

Inspirado no Reservas-Piscina-Academia.

Reutilizar conceitos:

- Button;
- Card;
- Input;
- Label;
- Badge;
- Dialog;
- AlertDialog;
- Textarea;
- Select;
- Table;
- EmptyState;
- ErrorState.

Não criar componente se HTML/CSS existente resolver adequadamente.

---

# 43. LOGO

Adicionar logo oficial em:

public/brand/

Não hotlinkar asset de outro sistema.

Documentar origem.

Preferir assets já utilizados oficialmente pelo hotel.

---

# 44. CORES

Antes de inventar nova paleta:

inspecionar o projeto Piscina/Academia e os ativos oficiais.

Criar tokens.

Exemplo conceitual:

--brand-background
--brand-surface
--brand-primary
--brand-primary-foreground
--brand-muted
--brand-border
--status-success
--status-warning
--status-danger

Evitar cores hardcoded em dezenas de componentes.

---

# 45. LAYOUT

Desktop/tablet:

Sidebar.

Itens previstos:

Hoje
Agenda
Programação
Experiências
Piscina
Academia
Osteria
Hóspedes
Relatórios
Configurações

Não exibir páginas ainda inexistentes apenas para parecer completo.

Usar feature flags quando necessário.

---

# 46. TABLET FIRST OPERACIONAL

Recepção e outros setores utilizam tablet.

Testar obrigatoriamente:

768px
1024px

Portrait
Landscape

Targets de toque:

preferencialmente >= 44px.

---

# 47. MOBILE

Funcionar bem em celular.

Mas não sacrificar eficiência desktop/tablet.

---

# 48. SERVER COMPONENTS

Preferir Server Components.

Usar Client Components somente onde interação exigir.

Não transformar páginas inteiras em:

"use client"

sem necessidade.

---

# 49. DATA FETCHING

Preferir server-side para carga inicial.

Client-side apenas para:

- interação;
- atualização otimista quando apropriada;
- Realtime;
- refresh específico.

---

# 50. REALTIME

Não adicionar Realtime automaticamente.

Usar onde trouxer benefício operacional claro.

Possíveis candidatos futuros:

- experiência acontecendo agora;
- Osteria;
- agenda Hoje.

Evitar listeners globais.

---

# 51. CACHE

Dados operacionais críticos não devem ficar desatualizados.

Definir explicitamente estratégia por consulta:

no-store
revalidate
Realtime

Documentar decisões relevantes.

---

# 52. PERFORMANCE

Prioridades:

1. correto;
2. simples;
3. medido;
4. otimizado.

Evitar otimização prematura.

Monitorar:

- queries duplicadas;
- renderizações desnecessárias;
- bundles grandes;
- imagens;
- dependências.

---

# 53. TESTES

Pirâmide:

            E2E
        Integration
          Unit

Maioria:

unit + integration.

Poucos E2E críticos.

---

# 54. TESTES UNITÁRIOS

Obrigatórios para regras como:

- capacidade;
- status;
- data/hora;
- permissões;
- agregação de agenda;
- mapeamento DTO;
- programação semanal;
- validação;
- booking rules.

---

# 55. TESTES DE INTEGRAÇÃO

Cobrir:

- repositories;
- Supabase Portal;
- migrations;
- constraints;
- RLS;
- adapters;
- queries.

Nunca executar teste destrutivo em produção.

---

# 56. CONTRACT TESTS

Integrações externas precisam de Contract Tests.

Especialmente:

Osteria adapter
Facilities adapter

Objetivo:

descobrir rapidamente quando schema externo mudou.

---

# 57. TESTES E2E

Fluxos críticos futuros:

Login
↓
Hoje

Experiência
↓
Criar ocorrência
↓
Criar reserva

Programação
↓
Criar evento

Agenda
↓
mostrar integração externa

---

# 58. BUGS

Todo bug deve seguir:

1. reproduzir;
2. criar teste de regressão quando possível;
3. corrigir;
4. comprovar teste verde;
5. registrar.

---

# 59. TEST BUILDERS

Preferir:

makeExperience()
makeOccurrence()
makeBooking()

Com defaults válidos.

Evitar fixtures enormes repetidas.

---

# 60. TESTAR COMPORTAMENTO

Evitar testes acoplados à implementação interna.

Preferir:

resultado observado.

Não quantidade de chamadas internas sem necessidade.

---

# 61. CI

Criar GitHub Actions.

Pipeline mínimo:

npm ci

npm run lint

npm run typecheck

npm run test

npm run build

E2E poderá ser job separado.

Nenhum merge com testes vermelhos.

---

# 62. PACKAGE SCRIPTS

Garantir:

dev
build
start
lint
typecheck
test
test:watch
test:integration
test:e2e
check

check:

lint
typecheck
unit tests

---

# 63. ENV

Criar validação das variáveis com Zod ou solução simples equivalente.

Portal:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

Integrações futuras:

FACILITIES_...
OSTERIA_...

Secrets jamais devem usar prefixo:

NEXT_PUBLIC_

---

# 64. SEGURANÇA

Nunca:

- commit .env;
- logar secrets;
- retornar secrets em APIs;
- colocar service role em Client Component;
- armazenar senha manualmente;
- confiar em validação client-side.

Toda entrada importante deve ser validada server-side.

---

# 65. VALIDAÇÃO

Toda mutation:

Zod ou validação equivalente server-side.

Validar:

- UUID;
- datas;
- enum;
- capacidade;
- status;
- strings;
- permissões;
- IDs relacionados.

---

# 66. POSTGRES COMO ÚLTIMA DEFESA

Quando possível:

- foreign keys;
- unique;
- check;
- not null;
- indexes adequados.

O banco deve proteger invariantes importantes.

---

# 67. MIGRATIONS

Toda alteração estrutural:

migration versionada.

Nunca realizar alteração manual em produção sem migration equivalente.

Migration deve explicar:

por quê.

---

# 68. SEED

Criar dados somente fictícios.

Exemplo:

Apto 201
João Teste
Maria Teste

Nunca copiar dados pessoais reais para repositório público.

---

# 69. LGPD

Dados pessoais previstos:

- nome;
- apartamento;
- telefone;
- histórico.

Documentar:

- finalidade;
- retenção;
- anonimização futura.

Relatórios devem usar agregados sempre que possível.

---

# 70. OBSERVABILIDADE

Logs server-side estruturados.

Exemplo:

requestId
module
action
duration
success
errorCode

Evitar dados pessoais completos.

---

# 71. HEALTH CHECK

Criar futuramente:

/api/health

Retornar apenas:

app
database
facilitiesIntegration
osteriaIntegration

Nunca secrets.

---

# 72. FEATURE FLAGS

Usar feature flags simples por ENV quando necessário.

Exemplo:

FEATURE_EXPERIENCES
FEATURE_FACILITIES_INTEGRATION
FEATURE_OSTERIA_INTEGRATION

Não adicionar plataforma externa.

---

# 73. EMPTY / LOADING / ERROR

Toda tela importante precisa prever:

loading
empty
error
success

Nunca deixar tela branca ou erro técnico bruto.

---

# 74. ACESSIBILIDADE

Obrigatório:

- labels;
- foco visível;
- teclado;
- contraste;
- aria quando necessário;
- erros associados a campos.

---

# 75. GIT

Commits pequenos.

Conventional Commits.

Exemplos:

feat(experiences): add occurrence model

test(experiences): cover capacity rules

feat(portal): add daily agenda shell

docs(ai): record phase 2 completion

Nunca:

updates
changes
fix stuff

---

# 76. UMA RESPONSABILIDADE POR COMMIT

Não misturar:

feature
refactor
migration
redesign

sem necessidade.

---

# 77. DOCUMENTAÇÃO PARA CONTINUIDADE ENTRE IAS

Criar obrigatoriamente:

docs/ai/PROJECT_CONTEXT.md
docs/ai/ARCHITECTURE.md
docs/ai/DOMAIN_MODEL.md
docs/ai/DECISIONS.md
docs/ai/PROGRESS.md
docs/ai/CHANGELOG_AI.md
docs/ai/KNOWN_ISSUES.md
docs/ai/TEST_MATRIX.md
docs/ai/INTEGRATIONS.md

Na raiz:

AGENTS.md

---

# 78. AGENTS.md

Deve ser pequeno e operacional.

Incluir:

- documentos obrigatórios para leitura;
- comandos;
- regras;
- arquitetura;
- sistemas que não podem ser modificados;
- processo de desenvolvimento.

---

# 79. PROJECT_CONTEXT

Explicar:

- hotel;
- problema;
- sistemas atuais;
- Portal;
- experiências;
- usuários;
- glossário.

---

# 80. ARCHITECTURE

Documentar:

- arquitetura atual;
- arquitetura alvo;
- módulos;
- bancos;
- boundaries;
- integrações;
- diagramas Mermaid.

---

# 81. DOMAIN_MODEL

Entidades iniciais:

Experience
ExperienceOccurrence
ExperienceBooking
WeeklyProgram
StaffUser
AuditEvent

Futuramente:

Stay
Guest

---

# 82. DECISIONS

ADR simplificado.

Formato:

ADR-001

Status:
Data:
Contexto:
Decisão:
Alternativas:
Consequências:

Nunca apagar ADR antigo.

---

# 83. PROGRESS

Arquivo crítico para continuidade.

Sempre conter:

Current phase
Status
Completed
In progress
Next step
Blocked by
Last verified commit
Tests status
Next AI instruction

Exemplo:

Current phase: Phase 3

Status:
WAITING_FOR_USER_APPROVAL

Last verified commit:
abc123

Tests:
lint PASS
typecheck PASS
unit PASS
build PASS

Next AI:
DO NOT START PHASE 4.
Wait for user approval.

---

# 84. CHANGELOG_AI

Registrar toda alteração relevante.

Campos:

Data
Solicitação
Fase
Arquivos
Motivo
Impacto
Testes
Commit

---

# 85. KNOWN_ISSUES

Não esconder problemas.

Registrar:

- dívida;
- risco;
- limitação;
- TODO importante.

---

# 86. TEST_MATRIX

Mapear:

requisito
→
teste

Exemplo:

Capacity cannot exceed limit
→ capacity.test.ts

Osteria mapping
→ osteria-adapter.contract.test.ts

---

# 87. INTEGRATIONS

Registrar:

- objetivo;
- direção;
- banco;
- formato;
- autenticação;
- riscos;
- status.

Sem secrets.

---

# 88. REGRA DE INÍCIO DE SESSÃO PARA QUALQUER IA

Antes de alterar código:

LER:

AGENTS.md
docs/ai/PROJECT_CONTEXT.md
docs/ai/ARCHITECTURE.md
docs/ai/DECISIONS.md
docs/ai/PROGRESS.md
docs/ai/KNOWN_ISSUES.md

Depois:

git status
git branch
git log --oneline -10

Confirmar:

- fase;
- branch;
- último commit;
- testes;
- trabalho pendente.

---

# 89. REGRA DE ALTERAÇÃO DE REQUISITO

Quando proprietário pedir alteração:

ANTES:

1. entender solicitação;
2. identificar módulos;
3. identificar riscos;
4. verificar ADRs;
5. definir testes.

DEPOIS:

implementar;
testar;
documentar;
commit.

---

# 90. FASES DE DESENVOLVIMENTO

Executar UMA FASE POR VEZ.

Ao final de cada fase:

- testar;
- documentar;
- commit;
- apresentar relatório;
- PARAR;
- aguardar autorização.

---

# FASE 0 — DESCOBERTA E PLANEJAMENTO

Não implementar produto ainda.

Objetivos:

1. confirmar criação do novo repositório Portal-Valle;
2. auditar sistemas existentes SOMENTE em leitura;
3. analisar identidade visual do Piscina/Academia;
4. localizar logo e assets;
5. mapear schemas;
6. mapear regras;
7. documentar integrações futuras;
8. definir arquitetura final.

Auditar:

luisdienstmanntd/Reservas-Piscina-Academia

e

luisdienstmanntd/Gerenciador-de-Reservas

Não modificar nenhum deles.

Criar documentação inicial.

STOP.

---

# FASE 1 — FUNDAÇÃO DO NOVO PROJETO

Criar novo Next.js.

Configurar:

TypeScript strict
Tailwind
lint
tests
Playwright
CI
ENV validation
estrutura inicial
design tokens
logo oficial

Criar:

README
AGENTS
docs/ai

Nenhuma integração externa.

Nenhuma feature operacional.

STOP.

---

# FASE 2 — DESIGN SYSTEM E SHELL

Criar visual baseado no sistema Piscina/Academia.

Implementar:

layout
header
sidebar
mobile/tablet navigation
cards
inputs
buttons
tables
dialogs
states

Criar rotas:

/hoje
/agenda
/programacao
/experiencias
/piscina
/academia
/osteria
/configuracoes

Rotas ainda podem ser empty state.

STOP.

---

# FASE 3 — SUPABASE PORTAL

Criar novo banco.

Implementar:

migrations
RLS
clientes server/browser
validação ENV
testes integração

Ainda sem experiências completas.

STOP.

---

# FASE 4 — AUTH

Supabase Auth Portal.

Perfis:

recepcao
gerencia
admin

Criar RBAC.

Criar E2E login.

STOP.

---

# FASE 5 — MODELO EXPERIENCE

Criar:

experiences
experience_occurrences
experience_bookings
audit_events

Criar domínio e testes.

Sem UI completa.

STOP.

---

# FASE 6 — LORA DEL VINO

Primeiro vertical slice.

Implementar:

criar occurrence
editar
cancelar
reservar
cancelar booking
capacidade
presença
responsável
observações

Testes completos.

STOP.

---

# FASE 7 — CINE TOSCANA

Reutilizar infrastructure.

Adicionar:

filme
local
capacidade por unit/booking

Não criar sistema paralelo.

STOP.

---

# FASE 8 — LA VERA PIZZA

Reutilizar módulo Experience.

Adicionar configuração necessária.

Sem financeiro avançado.

STOP.

---

# FASE 9 — PROGRAMAÇÃO SEMANAL

Implementar:

visual semanal
criar evento
editar
cancelar
duplicar semana

Não copiar reservas.

STOP.

---

# FASE 10 — AGENDA PORTAL

Criar:

GetDailyAgenda

Inicialmente apenas:

experiências Portal.

Criar timeline Hoje.

STOP.

---

# FASE 11 — INTEGRAÇÃO PISCINA/ACADEMIA READ-ONLY

Auditar acesso seguro.

Criar adapter.

Não alterar sistema externo.

Implementar:

reservas do dia
resumo

Adicionar contract tests.

STOP.

---

# FASE 12 — INTEGRAÇÃO OSTERIA READ-ONLY

Criar adapter.

Não alterar Osteria.

Implementar:

reservas do dia
pessoas
horários
mesas quando útil

Adicionar:

"Abrir Gestão da Osteria"

linkando para:

https://osteriadilucca.web.app/

STOP.

---

# FASE 13 — HOME HOJE COMPLETA

Combinar:

Experiências
Piscina
Academia
Osteria

Criar:

cards
timeline
status integração

Falhas parciais não derrubam sistema.

STOP.

---

# FASE 14 — RESILIÊNCIA

Testar:

Osteria offline
Facilities offline
Portal DB offline
timeout
schema incompatível
ENV faltando

Garantir graceful degradation.

STOP.

---

# FASE 15 — VISÃO ESTADIA

Somente após fase anterior estabilizada.

Criar conceito agregador de estadia.

Exemplo:

APTO 403

08/10
Lora

09/10
Piscina

09/10
Osteria

10/10
Cine

Ainda sem depender de PMS.

STOP.

---

# FASE 16 — RELATÓRIOS

Somente após possuir dados confiáveis.

Criar indicadores úteis.

Evitar vanity metrics.

Preparar views para Power BI.

STOP.

---

# FASE 17 — ESCRITA NOS SISTEMAS EXTERNOS

NÃO iniciar automaticamente.

Somente mediante autorização expressa.

Antes produzir análises técnicas.

Avaliar API/RPC oficial.

Nunca escrever diretamente ignorando regras externas.

STOP.

---

# FASE 18 — PORTAL DO HÓSPEDE

Futuro.

Somente após Portal interno estável.

Reutilizar regras e dados existentes.

Não criar segundo domínio paralelo.

---

# 91. DEFINITION OF DONE

Uma tarefa só está concluída quando:

[ ] requisito atendido
[ ] arquitetura respeitada
[ ] TypeScript verde
[ ] lint verde
[ ] unit tests verdes
[ ] integration tests verdes quando aplicável
[ ] E2E atualizado quando aplicável
[ ] build verde
[ ] sem segredo exposto
[ ] documentação atualizada
[ ] PROGRESS atualizado
[ ] CHANGELOG_AI atualizado
[ ] ADR criado se necessário
[ ] commit criado

---

# 92. REGRA PARA FINAL DE FASE

Responder sempre:

# FASE X CONCLUÍDA

## Objetivo

## Implementado

## Arquivos criados

## Arquivos alterados

## Banco

## Testes executados

## Resultado dos testes

## Riscos encontrados

## Pendências

## Commit

## Próxima fase

## Validação manual sugerida

E finalizar:

AGUARDANDO AUTORIZAÇÃO PARA INICIAR A PRÓXIMA FASE.

Não iniciar automaticamente.

---

# 93. DEPLOY

Produção desejada:

https://portalvalle.vercel.app

Criar projeto Vercel NOVO.

Nunca usar:

deploy do Piscina/Academia

ou:

Firebase Hosting da Osteria.

Ambientes:

local
preview
production

Preview antes de produção.

---

# 94. PRODUÇÃO

Nunca usar produção como ambiente de experimentação.

Mudanças de banco:

migration.

Mudanças sensíveis:

preview/test first.

---

# 95. NÃO IMPORTAR PLANILHAS AINDA

Dados antigos do Google Sheets não devem ser importados antes do schema estabilizar.

Quando chegar o momento:

criar ferramenta idempotente.

Fluxo:

parse
validate
dry-run
report
apply

Relatório:

válidas
inválidas
duplicadas
ignoradas

---

# 96. CÓDIGO LEGADO

Os sistemas existentes são sistemas operacionais válidos.

Não classificá-los automaticamente como "dívida técnica".

Não refatorar por preferência pessoal.

Integração deve respeitar seus contratos.

---

# 97. PRINCÍPIO DA SIMPLICIDADE

Antes de escrever código perguntar:

1. isso realmente precisa existir?
2. já existe solução equivalente?
3. pode ser uma função simples?
4. precisa mesmo ser classe?
5. precisa mesmo ser biblioteca?
6. precisa mesmo ser estado global?
7. precisa mesmo ser realtime?
8. precisa mesmo ser abstraction?

---

# 98. HIERARQUIA DA VERDADE

Quando houver divergência:

1. comportamento validado;
2. testes;
3. migrations/schema;
4. código atual;
5. documentação;
6. memória da IA.

Nunca confiar apenas em documentação antiga.

---

# 99. PRIMEIRA TAREFA DO CODEX

COMEÇAR SOMENTE PELA FASE 0.

Não criar feature.

Não alterar os sistemas existentes.

Tarefas:

1. verificar acesso aos repositórios;
2. confirmar que Portal-Valle será repositório independente;
3. estudar Reservas-Piscina-Academia;
4. estudar Gerenciador-de-Reservas;
5. documentar arquitetura;
6. mapear identidade visual;
7. localizar logo oficial utilizado;
8. mapear integrações;
9. mapear riscos;
10. criar documentação inicial do novo Portal;
11. propor stack exata;
12. propor estrutura do projeto;
13. propor plano de criação do Supabase novo;
14. apresentar relatório.

Nenhum deploy ainda.

Nenhuma escrita em banco externo.

Nenhuma alteração em repositório externo.

---

# 100. RESULTADO ESPERADO DA FASE 0

Responder:

# FASE 0 CONCLUÍDA

## Sistemas analisados

## Arquitetura encontrada

## Identidade visual encontrada

## Assets encontrados

## Bancos encontrados

## Integrações possíveis

## Riscos

## Arquitetura proposta para Portal-Valle

## Estrutura proposta

## Stack proposta

## Documentação criada

## Próxima fase

## Aguardando autorização

E PARAR.

---

# REGRA FINAL

O objetivo não é produzir a maior quantidade de código.

O objetivo é produzir o menor sistema possível capaz de resolver corretamente a operação do hotel e continuar fácil de evoluir daqui a anos.

Preservar os sistemas existentes.

Criar o Portal Valle como terceiro produto independente.

Projetar para manutenção por humanos e IAs.

Registrar decisões.

Testar regras críticas.

Não esconder riscos.

Não assumir.

Investigar antes de alterar.

Comece agora SOMENTE pela FASE 0.
