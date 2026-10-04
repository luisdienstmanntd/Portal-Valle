# Agenda diária — operação e contrato

A Fase 10 agrega exclusivamente sessões reais de Cine Toscana e La Vera Pizza. Não representa inscrições nem reservas dos legados. Hoje usa a data civil atual de America/Sao_Paulo; Agenda aceita dia YYYY-MM-DD válido de 1900 a 2099. O intervalo [início, próximo início) agrupa por starts_at. A fronteira civil encontra o primeiro instante do dia, incluindo saltos históricos de meia-noite; não soma 24 horas para formar o próximo dia.

GetDailyAgenda recebe providers identificados, relógio e timeout. Cada provider é isolado com allSettled, AbortSignal e deadline independente, inclusive se ignorar abort. O payload estrito admite até 100 sessões, valida horários, IDs únicos e links internos permitidos. IDs finais são compostos fonte:id; ordem por instante inicial e ID. A timeline não contém dados de hóspedes, apartamentos ou totais de inscrições.

Estados: unknown significa fonte não configurada, sem tentativa; unavailable significa timeout, erro ou payload inválido; empty significa consulta válida sem sessões; available significa consulta válida com sessões. Somente empty permite afirmar ausência de sessões. Horário de consulta/tentativa é exibido; erros técnicos brutos ficam fora do DTO. Fontes externas permanecem links em preparação, sem consulta.

As páginas exigem portal.read antes de carregar fontes. O provider próprio usa o cliente SSR autenticado e RLS das tabelas existentes; nenhuma credencial privilegiada no frontend. Canceladas/concluídas continuam visíveis com estado explícito. Horários finais fora do dia escolhido incluem a data. Alterações operacionais e duplicação semanal revalidam Hoje e Agenda.

Sem ENV, a prévia visual é preparação com conexão pendente. Banco/Auth reais são exercitados exclusivamente no CI Linux efêmero até provisionamento hospedado. Novos adapters devem manter estados separados, isolamento de erro e acesso somente leitura, cumprindo FACILITIES_AUDIT/OSTERIA_AUDIT antes de conectar sistemas existentes.
