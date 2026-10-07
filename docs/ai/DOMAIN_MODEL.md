# Modelo de domínio proposto

Proposta da Fase 0. Não representa tabelas criadas. IDs internos UUID, created_at/updated_at como timestamptz, enums/checks e relações validadas no banco.

## Experience

id, slug único, name, description, category (wine/cinema/gastronomy/wellness/leisure/other), booking_mode, capacity_mode (persons/bookings/units/unlimited), default_capacity, active, guest_bookable, created_at, updated_at.

booking_mode ainda precisa de vocabulário operacional; não criar enum arbitrário antes da Fase 5. `guest_bookable` fica false inicialmente. Capacidade limitada exige inteiro positivo; unlimited não usa limite numérico.

## ExperienceOccurrence

id, experience_id, starts_at, ends_at, location, capacity_override, status (draft/published/cancelled/completed), title_override, description_override, metadata, created_at, updated_at. ends_at > starts_at quando informado; metadados validados por configuração da experiência (filme, vinícola etc.), sem JSON arbitrário exposto ao cliente.

A capacidade efetiva é override ?? default. Proposta: snapshot do capacity_mode na occurrence para mudanças futuras do catálogo não reinterpretarem reservas existentes; confirmar na Fase 5 antes de migration. Só published admite novas reservas. Cancelled/completed fecham inscrições. Edição retroativa e transições inválidas são rejeitadas ou exigem operação administrativa auditada definida explicitamente.

## ExperienceBooking

id, occurrence_id, stay_id nullable (relação real somente quando Stay existir), apartment_number, guest_name, guest_phone nullable, adults, children, units, notes, status (reserved/confirmed/cancelled/no_show), attendance_status (pending/present/absent), created_by, created_at, updated_at. Acrescentar responsible_staff_id quando responsável operacional não for o criador; essa diferença não deve ser perdida.

adults/children são inteiros não negativos, total >0; units positivo quando exigido; apartamento é texto e nunca identificador único de pessoa/estadia. Registrar chave de idempotência e assinatura do pedido: mesmo pedido repetido retorna resultado anterior; mesma chave com payload diferente retorna conflito.

Proposta inicial para ocupação: reserved/confirmed consomem; cancelled libera; no_show fica reservado até encerramento/regras operacionais aprovadas para evitar realocação inesperada. Definir no_show com o hotel antes da Fase 6; não fixar silenciosamente uma política. Presença é eixo separado de confirmação e comparecimento não deve ser inferido por cronômetro.

## WeeklyProgram

Projeção de occurrences no intervalo semanal do hotel, inicialmente sem tabela duplicando títulos/horários. Se houver ordenação ou nota editorial futura, item referencia occurrence_id com unicidade. Duplicar semana exige confirmação, desloca datas no calendário local e cria novas occurrences/id; nunca copia inscrições ou presença. Operação idempotente e testada contra reenvio.

## StaffUser

Identidade em auth.users do Portal; perfil próprio com id correspondente, display_name, role (recepcao/gerencia/admin), active e timestamps. Recepção consulta Portal/integrações e opera inscrições/presença; gerência administra catálogo/programação e relatórios; admin configura acessos. Essa matriz proposta deve ser confirmada antes da Fase 4; evitar assumir que recepção pode gerir usuários ou roles.

## AuditEvent

id, actor_id, action, entity_type, entity_id, before/after seletivos, created_at, request_id. Append-only, acesso restrito, alteração de perfil não auditável pelo próprio usuário sem autorização. Garantir vínculo confiável do ator a auth.uid(); não aceitar actor do browser.

## Stay e Guest futuros

Não criar antecipadamente. Não correlacionar pessoas apenas pelo apartamento ou nome. [Estadias canceladas, ADR-018] Agregação futura deve considerar intervalo da estadia e identificador validado, sem copiar permanentemente bases externas.

## Resultados

Operações importantes retornam Result<T,E>, com UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, NOT_FOUND, CONFLICT, CAPACITY_EXCEEDED, INTEGRATION_UNAVAILABLE e DATABASE_ERROR. Mensagens PT-BR são distintas do erro técnico/log. Não mascarar timeout ou schema inválido como lista vazia.

