# Auditoria de leitura — Osteria Di Lucca

Data: 2026-10-01. Escopo: Fase 0 do Portal Valle. Somente código e metadados GitHub; nenhum login operacional, chamada ao Data API, leitura de registros de hóspedes, script da aplicação, migration, deploy ou alteração remota foi executado por este auditor.

## Proveniência e limites

- Repositório acessível: `luisdienstmanntd/Gerenciador-de-Reservas`, público, branch padrão `main`.
- Commit auditado: `42638d06eef9f694df4742aa29ce8c3f71d6a6e8`, commit datado 2026-07-17T17:20:34Z. Árvore Git recursiva retornou `truncated: false`.
- Todas as referências de linhas abaixo usam esse commit, não uma branch mutável. Prefixo dos links: `https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/`.
- Código foi obtido via ferramentas GitHub GET. Tentativa de clone via shell falhou por falta de conexão; nenhuma escalada ou credencial foi usada. Cópias de consulta em `work/osteria-source/` são um subconjunto dos arquivos, não um checkout executável/testado. Chave publicável do arquivo de cliente foi omitida da cópia de auditoria.
- O código comprova implementação versionada, não que esse SHA seja o deploy atual nem que todas as migrations tenham sido aplicadas. Catálogos PostgreSQL consultados pelo agente principal devem complementar este relatório, com proveniência própria. Não inferir ausência de uma coluna em produção somente por não estar no Git.
- Nenhuma suíte foi executada. A árvore contém 11 arquivos `*.test.js`, Vitest e jsdom; resultados em comentários/commits não contam como teste verde desta auditoria.

## Arquitetura efetivamente encontrada

- Aplicação estática em `index.html`, JavaScript ESM, CSS próprio e manipulação de DOM. Não é Next.js/React e não tem bundler na configuração lida. `package.json:6-10` define `type: module`, apenas scripts `test`/`test:watch`; `js/core/supabaseClient.js:10` importa SDK por CDN com versão explícita 2.110.2.
- Pacotes declarados: `@supabase/supabase-js ^2.110.2`, `vitest ^4.1.9`, `jsdom ^29.1.1`, Firebase em devDependencies `^12.16.0` (`package.json:23-31`). Essas são versões/ranges encontrados; não recomendação de atualizar nem stack proposta para Portal.
- Hospedagem Firebase: `firebase.json:2-4` aponta site `osteriadilucca`, public `.`; linhas 18-27 configuram no-cache para JS/CSS/HTML. Não se deve publicar Portal nesse hosting.
- Persistência e Auth atuais no código: Supabase. `js/core/supabaseClient.js:12` referencia `https://fiamtckdglzdrynmrlpj.supabase.co`. O identificador confirma o vínculo do projeto encontrado no catálogo, sem expor chaves.
- `js/core/database.js` é singleton de acesso Supabase, join de reservas+hóspedes e tradução snake_case → camelCase. Features: reservas, mesas, room service, dashboard/home, logs e notificações. Estado em módulo `js/core/state.js`; listeners Realtime refazem consultas, em vez de reconciliar cada alteração.
- Comentários antigos ainda mencionam Firebase/Firestore em alguns módulos, mas não são prova de banco atual. A implementação do cliente e do login tem precedência sobre esses comentários.
- Árvore `.github/workflows` contém apenas heartbeat Supabase; não foi encontrado workflow de lint/typecheck/build/test nesse SHA. Não se executou heartbeat: ele é uma operação de escrita.

## Autenticação e autorização versionadas

- `index.html:87-177` importa Supabase, mapeia os usuários operacionais recepcao/osteria/gerencia para contas e usa `supabase.auth.signInWithPassword` (linha 155). `onAuthStateChange` decide login e reinicia listeners (127-138); localStorage guarda rótulo do usuário, não é a prova de sessão.
- Migrations de RLS habilitam proteção nas seis tabelas iniciais e aplicam `FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)`: `20260709135200_rls_policies.sql:15-50`.
- Grants das tabelas operacionais são SELECT, INSERT, UPDATE, DELETE para `authenticated`: `20260709140241_grants_authenticated.sql:14-21`.
- `config_sistema` tem mesma política ampla, com SELECT/UPDATE concedidos, `20260710160000_config_sistema.sql:27-32`.
- Logo, uma conta comum da Osteria, mesmo usada só com `.select()` pelo Portal, possui capacidade de escrita na origem. Não é uma credencial read-only e não satisfaz isolamento técnico. Service role também não é alternativa aceitável para essa integração.
- `heartbeat` é exceção explícita: RLS e grants autorizam SELECT/INSERT/DELETE a anon/authenticated (`20260710120000_heartbeat.sql:18-34`). É tabela de manutenção, não interface operacional para o Portal.
- Views Power BI são criadas sem `security_invoker` na definição versionada e concedidas a authenticated. Inspecionar dono, reloptions e grants efetivos antes de qualquer uso; não presumir que uma view seja acesso mínimo somente por se chamar relatório. Catálogos atuais e testes de autorização em ambiente seguro são necessários.

## Schema versionado e semântica

O histórico contém 15 migrations, de `20260709133321_initial_schema.sql` até `20260717120000_governanca_dados_tempo.sql`. Mapear aplicação real separadamente; não reaplicá-las na Osteria.

1. `hospedes`: UUID, nome obrigatório, apto, codigo_reserva, telefone, tipo (`hospede`, `externo`, `passante`, `roomservice`), criado_em. `initial_schema.sql:19-29`. Deduplicação é lógica da aplicação, não chave única: apto+nome, código+nome ou telefone+nome; `database.js:128-215`. Hóspede não é uma estadia canônica; apto isolado não identifica pessoa/estadia ao longo do tempo.
2. `mesas`: identificador textual, tipo (`numerada`, `room_service`); seed inicial 1–18 e `ROOM`. `initial_schema.sql:32-40`. Tratar como string, não inteiro. A aplicação pode garantir existência de identificador ao atribuir mesa (`service.js:598-604`); não hardcode o conjunto para integração.
3. `reservas`: UUID; hospede_id nullable; mesa_identificador nullable; data DATE; horario e original_base TIME; posicao; paxs/adultos; chd/crianças; avulsa; obs; bloqueado; somente_hospedes; pagamento (`pago`, `pendente`, null); menu_degustacao; inicio_mesa/fim_mesa TIMESTAMPTZ; criado_em/atualizado_em. `initial_schema.sql:43-66`.
4. `reservas_log`: UUID, reserva_id informativo, acao, usuario textual, dados_antes/depois JSONB, criado_em. Ações evoluem de CRIAR/EDITAR/EXCLUIR/DESBLOQUEAR para CANCELAR e RESTAURAR. FK original foi removida em `20260709161500_remover_fk_logs_notificacoes.sql:16` para permitir histórico após exclusão. Não importar esses snapshots pessoais para Portal.
5. `config_dia`: chave data, linhas_extras JSONB; posterior flag bloqueios_semanais_aplicados. São metadados de grade e materialização de bloqueios, não uma disponibilidade completa.
6. `notificacoes`: UUID, texto, reserva_id informativo sem FK desde migration 20260709161500, lido_por TEXT[], criado_em. Leitura dos listeners pode causar escrita (ver riscos abaixo).
7. `heartbeat`: serial ID e timestamp, uso manutenção.
8. `config_sistema`: singleton id=1, capacidade default 30, mesas default 18, bloqueio_automatico, atualizado_em; depois bloqueios_semanais JSONB. Valores defaults não comprovam configuração operacional atual.

Evoluções relevantes de reservas:

- `bloqueio_origem_id` referencia a própria reservas com ON DELETE CASCADE, para bloqueios automáticos: `20260710140000_bloqueio_automatico.sql:15-18`.
- `cancelado_em` e `deposito_retido`: soft delete e desfecho manual de depósito; `20260711120000_cancelamento_reserva.sql:13-14`. Desfazer cancelamento limpa ambos, com histórico em log. Não transformar exclusão física em cancelamento no mapeamento.
- `origem_dados` e `confiavel_para_tempo`: dados anteriores a 2026-06-30 foram classificados como importação sem timestamp confiável para métricas de antecedência. `20260717120000_governanca_dados_tempo.sql:22-33`.
- Atualização automática de atualizado_em via trigger inicial. Índices em data, hóspede, mesa, log/notification reference, vínculo de bloqueio.
- Não há no SQL auditado check de paxs/chd não negativos, exclusão de sobreposição de mesa nem unicidade de posição da grade. A capacidade/ocupação é gerenciada pela aplicação. Isso limita o que o Portal pode afirmar; não é autorização para corrigir o sistema externo.

Views: `vw_reservas_detalhado`, `vw_reservas_por_dia`, `vw_reservas_por_dia_semana`, `vw_reservas_tempo_real`. As últimas definições de detalhado/tempo_real estão em `20260717120000_governanca_dados_tempo.sql:40-108`. Detalhado inclui telefone, observações e financeiro; leitura irrestrita seria excessiva para agenda. `tempo_real` significa timestamp confiável para análise, não um canal Realtime. Não usá-la para omitir reservas operacionais só por governança histórica.

## Regras a preservar na tradução

- Uma linha em reservas pode ser reserva real, bloqueio geral, bloqueio só hóspedes ou slot vazio. Somar todas as linhas produz contagem incorreta.
- Definição versionada de reserva real: hospede presente, NOT bloqueado, NOT somente_hospedes, cancelado_em IS NULL. `20260717120000_governanca_dados_tempo.sql:72-79`. A UI usa presença de nomes em vários trechos; contract tests devem cobrir hospede_id sem join/nomes ausentes e assinalar divergência, sem inventar hóspede.
- Horário do compromisso é `horario`; `original_base` define bloco da grade e pode divergir. `posicao` é layout, não regra de capacidade de pessoas. `database.js:77-89` normaliza TIME `HH:MM:SS` para `HH:MM`; não usar conversão UTC cega de DATE+TIME local.
- Horários padrão: 20:00, 20:30, 21:00, 21:30, 22:00, 22:30 (`state.js:58-60`). Blocos padrão têm três linhas e linhas extras configuráveis. Não impor isso como enum de horários válidos: app admite horário alterado/extra.
- Defaults: 30 lugares/18 mesas, bloqueio automático ligado (`state.js:19-30`), mas configuração real vem do banco.
- Bloqueio automático para reservas grandes: linhas extras = max(0, floor(paxs/2)-1); crianças não contam nesse cálculo (`service.js:109-134`). Para na primeira linha ocupada, não atropela outra reserva; pode criar só parte e avisar (`service.js:150-190`). Não confundir disponibilidade remanescente com subtração simples de pessoas.
- Bloqueios semanais são materializados uma vez por data, após carregar configuração; defaults qui/sex/sáb (1×20:00, 2×20:30, 1×21:00). Recepção pode desfazer sem recriação automática; `service.js:265-315`, `state.js:23-34`, migration 20260716120000.
- Validação de formulário: adultos 1–20, crianças 0–10, formato HH:MM, telefone opcional com máscara BR; hóspede exige apto OU código, room service exige apto; `validators.js:45-118`. Função de capacidade padrão 30 existe em 160-163; sua existência isolada não comprova proteção atômica em servidor.
- Cancelar preserva linha e histórico; restauração pode recalcular posição livre. Depósito retido/estornado é escolha operacional, não regra automática de 48h: `service.js:421-447`.
- Reserva roomservice recebe mesa textual `ROOM` automaticamente (`service.js:378-380`). Room service é um tipo da mesma reserva, não tabela independente. Tela dedicada filtra tipo e calcula Aguardando/Em preparo/Finalizado dos timestamps (`roomservice.js:26-50`).
- Mesas: atribuição atualiza mesa_identificador; início/fim gravam timestamps; remover mesa limpa só identificador (`service.js:598-622`). Não inferir presença do hóspede somente pela mesa atribuída.
- Cronômetros derivados de timestamps: salão verde <90min, amarelo <115min, vermelho >=115min; room service verde <45min e vermelho piscante após isso (`js/ui/timers.js:18-82`). São regras especializadas da Osteria; Portal inicial só deve mostrar estado útil, não reproduzir controle de timers.

## Riscos concretos para integração de leitura

1. **Bloqueador de conexão com mínimo privilégio.** Grants/RLS versionados não oferecem consumidor operacional read-only. Não fornecer senha da recepção ou service role ao Portal. Necessário confirmar interface/credencial SELECT-only já existente; se não existir, autorização específica para provisionamento na origem será pré-requisito futuro, sem execução nesta Fase 0.
2. **Inicialização da aplicação possui efeitos de escrita.** `init.js:82-90` dispara limpeza de config antiga e reservas fantasmas; `database.js:576` implementa DELETE de config antiga; `service.js:920-923` exclui fantasmas. Mesmo abrir código com sessão existente não equivale a inspeção read-only.
3. **Listeners também escrevem.** `listener.js:215-218` insere notificações; `database.js:418-443` marca notificações antigas como lidas automaticamente; fluxos de carregamento também materializam bloqueios semanais. Não importar módulos nem executar a aplicação externa no Portal.
4. **Campos pessoais e financeiros excessivos.** Query interna `database.js:249-261` usa `select('*, hospedes(*)')`. Novo adapter deve selecionar colunas explícitas e limitar data/período, sem logs/notificações/telefone/financeiro por padrão.
5. **Status não é enum canônico nas migrations auditadas.** É composto por cancelamento, flags e timestamps. Distinguir cancelled/scheduled/in_progress/completed do Portal sem gravar de volta, e guardar semântica desconhecida como erro de contrato. O agente principal relatou migration efetiva `status_recepcao` não encontrada neste histórico: verificar coluna e semântica antes de fechar contrato.
6. **Concorrência e consistência eventual.** `service.js:366-397` descreve inserção/limpeza sequenciais e log/bloqueio em background. Uma fotografia de SELECT não é garantia transacional de disponibilidade. Portal exibe reservas/resumo; nova disponibilidade ou edição permanece no sistema especializado.
7. **Views não minimizadas.** Detalhado inclui telefone e observações; falta security_invoker na definição Git. Não usar por conveniência até verificar permissões reais. A documentação corrente de Supabase deve orientar o desenho do acesso na fase de implementação.
8. **Deploy e migrations podem divergir do Git.** Não declarar que auditoria estática valida produção. Registrar diferenças obtidas em catálogo pelo agente principal e testar contrato contra metadata/ambiente de homologação antes da Fase 12.

## Integração proposta — planejamento, não implementada

Direção: Portal server → fonte Osteria; nenhuma dependência inversa. Source of truth permanece no Supabase Osteria. Módulo do Portal `src/integrations/osteria` com função adapter pequena e teste de contrato; UI e domínio não importam SDK/código da Osteria.

Contrato mínimo de leitura do dia, a confirmar com catálogos atuais:

- source fixo `osteria`; externalId UUID; serviceDate YYYY-MM-DD; startsAt derivado de horario + America/Sao_Paulo; adults=paxs; children=chd; participantCount=paxs+chd.
- displayName/apartment somente para recepção autenticada e autorizada; type do hóspede para distinguir salão/room service; tableLabel textual opcional; flags de cancelamento e timestamps operacionais quando úteis.
- Registrar fetchedAt e sourceStatus (available/unavailable/configuration_required/contract_error) no envelope da integração. Não transformar timeout em zero reservas.
- Bloqueios/slots vazios fora da lista de participantes; canceladas separadas ou marcadas, nunca contadas como confirmadas; data/hora local validada sem usar horário da máquina como fonte canônica.
- Excluir do DTO inicial telefone, código completo de reserva, pagamento, avulsa, deposito_retido, snapshots de auditoria e notificações. Observações só após definir necessidade/permissão; não transmitir automaticamente todos os textos livres.
- Sem cache compartilhado de dados pessoais; fetch server-side `no-store` inicialmente, timeout limitado, isolamento de falha por integração e botão de atualizar. Realtime somente se necessidade operacional for demonstrada depois.
- Sem escrita, trigger, listener importado, marcação de leitura, sincronização persistente de hóspedes, login compartilhado ou replay de logs. Testes usam fixtures fictícias.
- Link operacional preservado: `https://osteriadilucca.web.app/`, rótulo “Abrir Gestão da Osteria”.

Contract tests futuros devem cobrir: DATE/TIME, precisão de segundos, UUID e campos opcionais, ROOM textual, join ausente, bloqueio vs reserva real, cancelamento/restauração, room service, adultos/crianças, enum desconhecido, divergência de schema, timeout, 401/403, dados vazios e credencial incapaz de qualquer escrita. Prova negativa de escrita ocorre somente em ambiente isolado autorizado, nunca tentando mutação em produção.

## Evidências principais em links imutáveis

- [Cliente Supabase e projeto](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/js/core/supabaseClient.js#L10-L15).
- [Login Supabase](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/index.html#L87-L177).
- [Schema inicial](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/supabase/migrations/20260709133321_initial_schema.sql#L19-L109).
- [RLS](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/supabase/migrations/20260709135200_rls_policies.sql#L15-L50) e [grants](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/supabase/migrations/20260709140241_grants_authenticated.sql#L14-L21).
- [Mapeamento e consultas atuais](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/js/core/database.js#L92-L122).
- [Definição de reserva real e governança](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/supabase/migrations/20260717120000_governanca_dados_tempo.sql#L40-L108).
- [Boot com limpeza automática](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/js/core/init.js#L82-L90).
- [Cronômetros](https://github.com/luisdienstmanntd/Gerenciador-de-Reservas/blob/42638d06eef9f694df4742aa29ce8c3f71d6a6e8/js/ui/timers.js#L18-L82).

Conclusão: há contrato suficiente no código para planejar o adapter, mas a ativação deve aguardar validação de schema atual e acesso efetivamente SELECT-only. Nenhuma alteração na Osteria é necessária para entregar a Fase 0 ou fundação do Portal; manter integração desabilitada até resolver os pré-requisitos na fase apropriada.

