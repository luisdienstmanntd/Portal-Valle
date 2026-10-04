# Programação semanal

Projeção de occurrences reais do Cine/Pizza em segunda-domingo, America/Sao_Paulo, por instante de início [segunda00:00,próxima segunda00:00). Evento que termina no dia seguinte permanece no dia inicial. Sem tabela editorial paralela. Sessões mostram estado e link para formulário existente; alterações revalidam programação. Recepção lê; gerência/admin duplicam via weekly_program.manage e criam/editam/cancelam via experiências.

Destino da duplicação deve estar vazio inclusive de sessões canceladas; fonte tem até100sessões Cine/Pizza ativos draft/published. Novos IDs, version1, responsável operador atual, statusdraft. Nenhum booking/hóspede/presença copiado; origem preservada. Horários locais convertidos individualmente com verificação de gap. Lock global compartilhado com writers de occurrence antes de catálogo/row impede corrida de cópias/criação; reserva continua serializando capacidade por ocorrência. Idempotência actor/request/hash/operação, array de resultados privado. Falha desfaz clones/receipt/auditoria.

Prévia sem ENV apresenta dias com conexão pendente e operações desabilitadas. Hosted/contas reais/retenção/Lora continuam pendentes. Limite de100 na leitura detecta excesso e informa falha completa, não apresenta semana truncada. Datas futuras/pasadas não criam recorrência automática.
