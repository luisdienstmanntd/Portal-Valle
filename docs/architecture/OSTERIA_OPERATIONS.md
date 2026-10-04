# Osteria — contrato de leitura preparado

A origem permanece Osteria. main confirmado no snapshot42638d06eef9f694df4742aa29ce8c3f71d6a6e8, idêntico à auditoria. Não houve consulta ao banco hospedado Osteria nesta fase, login, leitura de reservas/hóspedes ou execução do runtime legado. Catálogo de2026-10-01 é evidência datada, sem renovação alegada. A autorização adicional de metadados do turno anterior referia-se a Facilities.

Port readDay(date, signal) retorna {rows,complete:true}; resposta incompleta ou lote inválido falha integralmente. Factory server-only retorna null incondicionalmente. Não há transport HTTP/Supabase, ENV habilitadora, Auth comum, service_role ou views amplas. Uma credencial usada só para SELECT não comprova restrição de escrita.

Projeção proposta: id, data, horario, hospede_id, hospedes(tipo), paxs, chd, mesa_identificador, bloqueado, somente_hospedes, cancelado_em. Join mínimo somente tipo; nenhuma identidade de hóspede é exposta no DTO final. Sem nome, apartamento, código, telefone, notas, pagamento, depósito, grade original_base/posicao, logs/notificações ou timers. Schema estrito rejeita colunas extras.

Linhas vazias ou com bloqueado/somente_hospedes ficam fora das reservas. Reserva com hospede_id presente e join mínimo ausente falha o lote; sem inventar tipo. Paxs precisa ser positivo para reserva real; chd inteiro não negativo. Limites técnicos500linhas/1000 por contagem protegem payload, não representam capacidade do restaurante. Não impor horários padrão20h–22h30. Mesa é string ou null; tipo roomservice vem do join, nunca inferido somente de ROOM.

Data real1900–2099 e horário civil HH:mm ou HH:mm:ss de America/Sao_Paulo, com segundos preservados e gap histórico rejeitado. Conversor comum passou a usar precisão de segundos inclusive offsets históricos; assinaturas em minutos permanecem aceitas. Não há duração/end inferida para Osteria. UUID normalizado e prefixado osteria:, duplicatas inclusive diferenças de caixa rejeitadas, ordenação por início/ID.

Cancelado_em não nulo marca cancelled; null marca scheduled (reserva não cancelada, não comprovação de presença/chegada). Canceladas são exibidas distintamente e excluídas de totais ativos. Resumo de ativos soma paxs/chd/pessoas; roomservice contado separadamente e explicitamente incluído nos totais. Bloqueios não contam como pessoas/reservas. Nenhum percentual de ocupação, capacidade default ou disponibilidade deduzida. Restauração se reflete na próxima consulta; sem cache/persistência/sincronização.

Unknown/falha têm summary=null; apenas consulta completa validada permite zero. Timeout/abort limitam provider inclusive não cooperativo e limpam timers. Erro técnico sanitizado; falha Osteria não acessa nem altera experiências/Facilities. Página guarda osteria.read antes de qualquer carga; sem configuração própria Auth mantém preparação pública já autorizada, factory sempre null.

Link operacional explícito: Abrir Gestão da Osteria → https://osteriadilucca.web.app/. Páginas não carregam scripts/listeners da origem, que poderiam escrever. Só navegação voluntária pelo usuário abre a gestão. Antes de habilitar leitura: comprovar endpoint/identidade SELECT-only, renovar contrato/schema em ambiente autorizado, testar projeção mínima/completude/autorizações sem escrever em produção. Integração operacional continua pendente.
