# Auditoria de Facilities — Fase 0

Data: 01/10/2026. Escopo: leitura estática do repositório `luisdienstmanntd/Reservas-Piscina-Academia`, sem alteração remota, execução de scripts, consulta a reservas/pessoas ou acesso por credenciais de produção. Skill Supabase consultada para orientar leitura de schema/RLS. Não constitui teste de intrusão nem comprovação da configuração implantada.

## Evidência e acesso

- Repositório acessível pelo conector GitHub, público, branch padrão `main`.
- Snapshot auditado: `eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0`, commit de 30/09/2026 22:54:10 UTC. Árvore: `a1dc9836a8cd8709b5d8a8ec10ce48c6cb9aefaa`.
- [Snapshot no GitHub](https://github.com/luisdienstmanntd/Reservas-Piscina-Academia/tree/eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0).
- Shell clone falhou por indisponibilidade de rede; investigação concluída pelo conector GitHub. Arquivos de evidência foram copiados para `work/facilities-source/`, sem executar código do repositório.
- Produção documentada em `README.md:302`: `https://valle-piscina-academia.vercel.app`. Nesta auditoria não houve teste funcional ou leitura da produção.
- URL Supabase é recebida por ENV (`src/lib/supabase/admin.ts:20-30`), sem ref literal encontrado nos arquivos relevantes lidos. Nome do pacote é `valle-dincanto-piscina`; associação com projeto Supabase homônimo precisa de confirmação separada por catálogos/metadados. Não ler `.env` nem solicitar keys para essa confirmação.

## Arquitetura encontrada

Next.js App Router com páginas de hóspedes, recepção, Server Actions e Supabase JS administrativo no servidor. Rotas da árvore: `/`, `/hospede`, `/hospede/piscina`, `/hospede/academia`, `/recepcao`, `/acesso-negado`. Não há `src/app/api`/Route Handler na árvore auditada; as operações atuais são Server Actions, um contrato de aplicação Next, não uma API de integração pública versionada.

- `src/app/actions/reservations.ts`: login, consulta de ocupação, listagem por instalação e dia, criação, alteração de nome/telefone/notas, marcação WhatsApp e cancelamento.
- `src/app/actions/stays.ts`: criação e validação de tokens de estadia.
- `src/lib/reservations.ts`: tipos, horários e formatação; `booking-zod.ts`: schemas de entrada; `reservation-slot-validation.ts`: data e slot; `hotel-time.ts`: data civil em America/Sao_Paulo.
- `src/components/guest-booking.tsx` e `src/app/recepcao/reception-dashboard.tsx`: fluxos cliente. A recepção consulta novamente a grade a cada 30 segundos, pausando em operações em andamento (`reception-dashboard.tsx:388-399`). Não depende de Realtime para esse fluxo.
- `src/lib/supabase/admin.ts:20-30`: service role com persistência de sessão e refresh automático desligados. O código declara uso apenas no servidor. Não existe cliente read-only dedicado evidenciado.
- Hóspede recebe UUID aleatório como link de acesso, convertido para cookie httpOnly; servidor valida existência em `active_stays`, apartamento permitido e checkout inclusivo (`stays.ts:27-52,58-97`; `middleware.ts:13-42,57-66`). A leitura de middleware usa `cache: no-store`.
- Recepção usa senha compartilhada em `RECEPTION_PASSWORD` e cookie de 12 horas (`reservations.ts:45-63`). Não usa Supabase Auth no código observado, apesar de README declarar genericamente Supabase + RLS.

## Stack real travada

As versões abaixo vieram de `package-lock.json`, blob `42b0a6baeae5a99445a84e15ac43a8862c053d7f`; não são interpretação dos ranges do package.json.

- Next.js 15.5.14 (`package-lock.json:5833`), React / React DOM 19.2.4 (`:6283,:6310`).
- Supabase JS 2.101.1 (`:2249`), Zod 3.25.76 (`:7753`), TypeScript 5.9.3 (`:7260`).
- Tailwind CSS 4.2.2 (`:7029`), Radix Alert Dialog 1.1.15, Lucide React 0.487.0, shadcn `new-york`/neutral/CSS variables (`components.json`).
- Vitest 3.2.4 (`:7517`), Playwright 1.59.1 (`:1402`), ESLint 9.39.4.
- `tsconfig.json` define `strict: true`, alias `@/*` para `src/*`.
- Scripts existentes: dev/build/start/lint, db local, unit/watch/integration/e2e. Não há scripts typecheck/check no package.json atual.
- Único workflow encontrado na árvore é `.github/workflows/supabase-keepalive.yml`: consulta mínima de id com service role, 2x/dia; não é pipeline completo de qualidade. Não executado.

## Schema versionado

`public.reservations` tem:

- `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`.
- `facility text NOT NULL DEFAULT 'pool'`, check `pool|gym`.
- `reservation_date date NOT NULL`, `slot_start time NOT NULL`, `apartment_number text NOT NULL`.
- `guest_checkout_date date NULL`, `guest_name text NULL`, `guest_whatsapp text NULL`, `notes text NULL`.
- `created_at timestamptz NOT NULL DEFAULT now()`.
- `created_by text NOT NULL DEFAULT 'guest'`, check `guest|reception` (origem; não id individual de funcionário).
- `confirmation_sent boolean NOT NULL DEFAULT false`, `warning_sent boolean NOT NULL DEFAULT false` (marcação de mensagens, não status da reserva).
- UNIQUE `(facility,reservation_date,slot_start)` e UNIQUE `(facility,reservation_date,apartment_number)`.
- Check de horário inteiro válido por instalação; índices em data, apartamento e instalação+data.
- Não há status, número de pessoas, check-in, attendance, preço, `updated_at`, soft delete ou histórico de cancelamentos nesse schema. Cancelamento é DELETE (`reservations.ts:676-712`).

`public.active_stays` tem `id uuid PK`, `token text NOT NULL UNIQUE`, `apartment_number text NOT NULL`, `checkout_date date NOT NULL`, `created_at timestamptz NOT NULL DEFAULT now()`, índice em token. Não há FK entre estadia e reservas nem id PMS no schema auditado. Tokens não devem entrar no DTO do Portal.

Migrações encontradas, todas apenas lidas:

1. `20260404000000_init_reservations.sql`: tabela inicial, checks, índices, RLS e grants; linhas 14-59 e 67-77.
2. `20260405120000_reservations_facility.sql`: instalação, unicidades por instalação, novos checks; linhas 4-57.
3. `20260407120000_reservations_guest_whatsapp.sql`: telefone.
4. `20260408140000_reservations_whatsapp_flags.sql`: flags de envio.
5. `20260409000000_reservations_guest_name.sql`: nome.
6. `20260410120000_active_stays.sql`: tokens de estadia; linhas 3-19.
7. `20260416120000_lgpd_reservations_anonymize_cron.sql`: pg_cron, anonimização periódica; linhas 13-43.

`supabase/setup_supabase_cloud.sql` oferece criação consolidada das duas tabelas, mas não inclui o cron de anonimização da última migration. Não se pode concluir que todos os ambientes foram criados/aplicados da mesma maneira somente pelo código.

## RLS e viabilidade somente leitura

As migrations habilitam RLS em ambas as tabelas, revogam todos os privilégios de `anon` e `authenticated`, concedem todos a `service_role` e não criam policies públicas (`init:67-77`; `active_stays:16-19`). Isto restringe acesso público; a aplicação se apoia em autorização própria do servidor com chave administrativa. Não há evidência no repositório de role/grant/policy de integração read-only.

A documentação oficial confirma que grants de objeto e RLS são camadas distintas e que o mínimo privilégio precisa ser explícito: [Supabase, Securing your API](https://supabase.com/docs/guides/api/securing-your-api). Logo, usar somente SELECT no adapter com service role não transforma aquela credencial em read-only.

Proposta para Fase 11, sujeita a nova auditoria de acesso:

- Portal consulta apenas dados mínimos por dia, server-side, por adapter independente. Nunca importar ações administrativas do sistema antigo nem compartilhar sessão/cookie da recepção.
- Primeiro verificar se já existe credencial de SELECT restrito, endpoint oficial de leitura ou infraestrutura aprovada fora do repositório. Nenhum foi comprovado nesta auditoria.
- Se não houver, integração deve permanecer desabilitada/pendente. Criar role, policy, view, RPC ou API no sistema existente é alteração externa e exige autorização específica; não realizar como efeito colateral do Portal.
- Service role externa ampla não é opção equivalente a least privilege e não deve ser apresentada como solução read-only segura já disponível.
- Contrato inicial poderia ler `id,facility,reservation_date,slot_start,apartment_number` e apenas incluir nome quando finalidade operacional e permissão forem justificadas; telefone, notas livres, tokens e flags WhatsApp ficam fora por padrão.
- Identidade externa composta `facilities:<id>`; source = facilities; module = piscina/academia; startsAt derivado de data civil + hora em America/Sao_Paulo; endsAt = início + 60 minutos; status observado = reserva existente/confirmada, sem inventar cancelamentos ou presença.
- Query filtrada por `reservation_date`, facility `pool|gym`; selecionar colunas explicitamente; validar payload e enums; timeout e falha parcial por integração; sem cache persistente para operação do dia. Não implementar agora.
- Contract tests futuros: schema, horário 00:00, data de virada de dia, enum inválido, duplicidade de ids, ausência de dados, timeout, permissão negada, erro parcial e exclusão/cancelamento entre leituras. Nunca usar banco de produção para criar/excluir fixtures.

## Regras de negócio observadas

- Piscina reserva slots de 60 minutos de 13:00 até 23:00 e 00:00. São 12 slots por data civil. Academia reserva 24 slots de 60 minutos, 00:00 a 23:00 (`src/lib/reservations.ts:4-34`). Home informa piscina aberta 09h–01h, mas uso exclusivo/reservável 13h–01h (`src/app/page.tsx:32-47`). Não criar reservas 09h–12h no Portal com base só no horário de abertura.
- 00:00–01:00 pertence à data civil em que inicia a meia-noite, expressamente documentado na migration inicial (`:17-18`). Não deslocar automaticamente para o dia seguinte ao agrupar a agenda.
- Limite: um apartamento por slot por instalação; um slot por apartamento/data/instalação. Piscina e academia são independentes. As duas unicidades no PostgreSQL resolvem disputa concorrente (`facility.sql:22-28`).
- Validação servidor barra datas anteriores a hoje, datas após checkout e horários fora dos slots (`reservation-slot-validation.ts:12-30`). Hoje em America/Sao_Paulo (`hotel-time.ts:1-4`). A regra não valida se o horário de hoje já passou; não atribuir comportamento que não está no código.
- Recepção grava `guest_checkout_date = reservationDate` ao criar reserva (`reservations.ts:388,428`), portanto não representa checkout real neste fluxo.
- Hóspede deriva apartamento e checkout da estadia validada; não pode informar livremente o apartamento na action (`reservations.ts:249-281`).
- WhatsApp obrigatório para hóspede e opcional na recepção; nome opcional, máximo 200 caracteres. Notas na criação máximo 500 caracteres; edição máximo 2000 (`booking-zod.ts:43-81`; `reservations.ts:518-539`). Registrar diferenças como contrato atual, sem refatorar.
- Cancelamento remove registro. Não é possível deduzir histórico completo nem status cancelled por consulta da tabela atual.

## Identidade visual e assets

Paleta real em `src/app/globals.css:34-70` (blob `2afeeee3c2fb8ad65263de22952d776e5832a1cb`):

- Fundo creme `#f9f7f2`; texto carvão `#2d2926`; cards e popovers brancos.
- Primária/rodapé/foco castanho `#604d3f`, foreground creme.
- Header/acento azul acinzentado `#d1d8df`.
- Secundária `#e8e4df`, muted `#ebe8e4`, texto muted `#6b6560`.
- Borda/input `#ddd8d2`.
- Slot disponível `#8da4b7` com texto `#f9f7f2`; ocupado `#d6d3d1` com texto `#5c5652`.
- Raio base `.625rem`, variantes base−4px/base−2px/base/base+4px.
- Inter para interface e Playfair Display para títulos, ambos via next/font/google com display swap (`src/app/layout.tsx:2-17`; `globals.css:12-13`).

Padrões observados: títulos serifados, corpo sans, cards com bordas suaves e sombra discreta, botões castanhos com variantes outline/secondary/ghost, foco visível de 3px; componentes shadcn locais (button/card/input/textarea/label/badge/calendar/alert-dialog/sonner). Ícones Lucide. Recepção usa tabela larga responsiva com scroll horizontal e forms de duas colunas (`recepcao/layout.tsx:4-6`, `reception-dashboard.tsx:590,790,864`). Hóspede usa largura compacta `max-w-lg`/`md:max-w-2xl` e grade de slots (`guest-booking.tsx:255,408-423`). Não há sidebar atual evidenciada: Portal pode introduzir a navegação prevista mantendo identidade.

Logo realmente referenciado nas telas lidas:

- `public/logo-valle-dincanto.jpg`, 24.202 bytes, 1024×364, blob `26ea3e2bc6e2b2fc3a9728baaff4278863efc3ab`. Inspecionado visualmente: marca VALLE D'INCANTO castanha em fundo muito claro. Usado em home (`page.tsx:20-27`), hóspede (`guest-booking.tsx:257-262`), login e dashboard recepção (`reception-dashboard.tsx:536-541,593-598`). É a evidência de marca usada pelo sistema, não um arquivo vetorial/marca mestra cuja oficialidade tenha sido confirmada externamente.
- [Logo utilizado](https://github.com/luisdienstmanntd/Reservas-Piscina-Academia/blob/eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0/public/logo-valle-dincanto.jpg).
- `public/brand/logo-header.png`, 8.498 bytes, 354×140, blob `4a329d50147e7462708eee5f995eb15bc2b4e021`. Inspecionado visualmente: letras claras sobre fundo castanho.
- `public/brand/logo-valle-dincanto.png` e `public/brand/logo-valle-top.png`, ambos 26.016 bytes e o MESMO blob `d923f72032a678dd07960432f4871736f7a1c4d4` (duplicação exata de conteúdo).
- `public/favicon.png`, 5.248 bytes, blob `cbb05c19d58ec5f3d52d68a85340372bd297812f`; utilizado como icon/apple pelo layout.
- `src/components/valle-wordmark.tsx` é uma recriação tipográfica por spans, não logo raster oficial. Não escolher essa recriação no lugar do asset já usado.
- Não há SVG de logo, fonte de design ou manual de marca na árvore obtida. Não redesenhar logo; futura incorporação deve preservar proporção e arquivo escolhido.

## Riscos e divergências comprováveis

1. **Prioridade alta, autorização recepção.** `src/lib/reception-auth.ts:3-8` compara cookie a valor literal constante; não há assinatura, lookup de sessão, id usuário ou expiração validada no servidor. Actions leem esse mesmo booleano antes de usar service role. `httpOnly`, Secure e maxAge no cookie emitido não acrescentam prova de autenticidade a um valor fixo recebido. O padrão não deve ser copiado para Portal. Não houve exploração nem tentativa de contornar login; avisar proprietário e manter correção do sistema existente fora deste escopo.
2. **Integração segura ainda não comprovada.** RLS sem policies para anon/authenticated + service role com ALL não entrega acesso externo de SELECT restrito. Desbloqueio depende de infraestrutura de leitura aprovada ou alteração externa expressamente autorizada.
3. **Código/documentação não provam estado do banco nem deploy.** Precisam de confirmação independente as migrations aplicadas, constraints, grants, cron ativo e versão implantada. README genérico declara Supabase Auth/Realtime, mas fluxo auditado usa cookie próprio e polling.
4. **Retenção parcial.** Migration de cron anonimiza somente guest_name e guest_whatsapp em reservas, com corte COALESCE(checkout,reservation_date) < CURRENT_DATE (`lgpd...sql:29-43`). Não anonimiza apartamento/notas/active_stays. Não inferir conformidade LGPD integral por existir script. Cron `0 3 * * *` é 03:00 UTC, não 03:00 hotel; aplicação real não comprovada.
5. **Regras temporais e status.** Meia-noite é mesma data civil; cancelamento é delete; checkout de recepção é data da reserva. Adapter que transportar interpretação diferente produzirá agenda ou histórico incorreto.
6. **Contrato frouxo de datas.** Zod valida regex yyyy-MM-dd sem validação semântica de calendário (`booking-zod.ts:6-7`). Banco date rejeita datas inválidas, mas Portal deve validar de forma independente. Não corrigir sistema antigo nesta fase.
7. **Variação de schema de instalação.** SQL consolidado não inclui cron; versão documentada pode divergir do aplicado. Manter snapshot e contract tests futuros.

## Verificação e limites

Realizado: confirmação GitHub, leitura de árvore completa, leitura de 7 migrations, Server Actions, contratos, autorização, tokens visuais, package-lock e componentes principais; inspeção visual de logo JPG e logo-header PNG. Nenhum segredo foi lido ou publicado e nenhuma tabela operacional foi consultada por este agente.

Não realizado: npm install, lint, typecheck, testes unitários/integration/e2e, build, queries operacionais, aplicação de migrations, login de produção, deploy ou alteração de repositório externo. Testes de concorrência existentes em `tests/integration/reservations-concurrency.test.ts:56-150` exercitam unicidades e destinam-se a Supabase local; sua existência não significa aprovação atual. O estado de testes nesta auditoria é **NÃO EXECUTADOS (somente leitura)**.

Changelog markdown Supabase foi tentado e ferramenta web rejeitou content-type text/markdown; guia oficial de segurança HTML foi lido. Nenhuma implementação Supabase dependeu de presumir conteúdo do changelog.

Conclusão da auditoria de código: Facilities pode ser fonte de agenda por reserva existente e data/instalação. Contrato dos dados é simples e mapeável; caminho de autenticação somente leitura ainda precisa ser comprovado. Preservar o sistema, não compartilhar autenticação e não habilitar integração por credencial administrativa ampla sem uma decisão explícita do proprietário.

