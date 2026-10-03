# Modelo de experiências — Fase 5

Atualização Fase6 adaptada validada em CI37155203841: proprietário escolheu Cine primeiro e somente adultos. `persons_per_unit=2`, `children_allowed=false` no catálogo Cine, version/responsible_id e RPCs de operação adicionados; os parágrafos abaixo registram a fundação da Fase5, antes das escritas. Puffs provisoriamente exclusivos ceil(adults/2); Lora adiada. Auditoria de bookings exige bookings.manage. Consulte CINEMA_OPERATIONS para comportamento e limites atuais.

Experience é o catálogo; occurrence é sua realização com instantes explícitos; booking é a inscrição de um grupo. A programação semanal futura consultará occurrences, sem outra tabela de eventos. O domínio em `src/modules/experiences/domain` importa apenas Zod e seus próprios tipos. Linhas completas do banco passam por infrastructure/mapping: valida/remova created_at/updated_at e valida o DTO antes do cálculo puro. Não passar Row bruto a summarizeCapacity. Não há UI operacional, serviço genérico ou adapter externo nesta fase.

## Capacidade e decisões do proprietário

Modos: persons, bookings, units e unlimited. Quantidades inteiras entre 0 e 10000; zero é fechamento explícito, não fallback. Unlimited usa null, sem denominador fictício. Override null herda o catálogo; override zero fecha a occurrence. `person_limit` e seu override representam limite físico adicional, contando adultos e crianças independentemente da unidade principal.

O proprietário informou Cine Toscana: **8 pessoas, 4 puffs de casal**. Modelo suporta units=4 e person_limit=8, com testes separados dos dois limites. Nenhuma occurrence operacional foi criada ou capacidade real ativada. A alocação por puff/grupo será detalhada no fluxo Cine (Fase 7), sem assumir ocupação mínima ou compartilhamento entre reservas.

O proprietário pediu deixar a regra da Lora para depois. `countChildren` e `noShowConsumesCapacity` são políticas obrigatórias recebidas pelo cálculo puro, sem defaults nem cadastro real de Lora. Canceladas não consomem; presença é independente do status. O cálculo recusa mistura de experiências/occurrences e IDs duplicados. Ele é somente projeção: não autoriza uma reserva nem protege concorrência.

## Contratos e limites atuais

`booking_mode=group` representa a inscrição de grupo pedida no modelo, sem inventar modos de autoaprovação. `guest_bookable=false` é imposto até existir fluxo público autorizado. `stay_id` é UUID reservado com CHECK null até Fase 15; nenhum FK a PMS/legados. `created_by` referencia perfil e preserva histórico como null se o operador for removido. Operações futuras devem atribuí-lo no servidor, nunca a partir do formulário.

Instantes são timestamptz no SQL; domínio exige ISO com offset e fim posterior ao início. Timezone operacional continua America/Sao_Paulo. Metadata admite somente film_title opcional, sem dados pessoais livres. Campos textuais e quantidades têm limites no domínio e no SQL.

## Banco e acesso

Quatro tabelas próprias: experiences, experience_occurrences, experience_bookings e audit_events. FK locais com índices, exclusão restrict entre catálogo/occurrences/reservas e timestamps de atualização por trigger. Leitura exige perfil ativo e sessão viva via has_permission: experiences.read para catálogo/occurrences/reservas, settings.manage para auditoria.

RLS em todas, grants explícitos. INSERT/UPDATE/DELETE não são concedidos a anon/authenticated/service_role. Ainda não há RPC de escrita. Isso impede bypass direto de futura capacidade/idempotência. A exceção actor null do trigger não autoriza requests sem identidade: qualquer RPC futura deve exigir has_permission/sessão viva antes de mutar, inclusive quando auth.uid for null. Escritas SQL administrativas nos testes não comprovam proteção de lotação; locks, invariantes entre tabelas e concorrência entram na Fase 6 antes de liberar operações. Não há seed operacional.

## Auditoria atômica

Triggers AFTER registram INSERT/UPDATE/DELETE na mesma transação, com actor obtido de auth.uid. Actor de sessão deve ter experiences.manage; SQL administrativo sem Auth fica com actor null (sistema). Função definer restrita a schema private, search_path vazio e sem EXECUTE ao cliente; privilegia somente a inserção na auditoria imutável para clientes.

Before/after usam allowlist explícita de IDs, categorias, flags, instantes, capacidades, quantidades, status e presença. Não incluem nome, apartamento, telefone, notas, descrições, local, título, metadata, senha ou token. Novos campos não entram automaticamente. Teste provoca falha no INSERT da auditoria e verifica rollback da alteração da reserva. Audit persiste depois da exclusão da entidade. Retenção/anonimização antes de dados reais continua pendente.

## Validação

`model.test.ts` testa modos/unidades, limites duplos Cine, políticas obrigatórias, status/presença, override zero, ilimitado, vínculos, validação de quantidade/PII e instantes. `portal_experiences.test.sql` testa schema/grants/RLS, constraints, actor, allowlist, antes/depois, exclusão e rollback atômico. Banco executado somente em CI Linux efêmero; hosted continua adiado.

Changelog Supabase consultado em 2026-10-03: mudança de grants/Data API tratada explicitamente; PG 17.11 não exige alteração neste schema sem ltree, cifras PGP antigas, float btree_gist ou operadores customizados. [Grants](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), [PG](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes). Nenhuma alteração nos projetos legados.
