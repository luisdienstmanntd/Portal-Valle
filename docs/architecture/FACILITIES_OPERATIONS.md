# Facilities — contrato do adapter preparado

readFacilityDay recebe somente um port readDay(date, facility, signal). O retorno deve ser {rows, complete:true}; resposta incompleta, excesso ou schema divergente falham sem resumo parcial. Factory server-only retorna null até existir acesso restrito verificado. Não há implementação HTTP/Supabase externa nem ENV de conexão/ativação nesta entrega.

Colunas mínimas: id UUID, facility pool|gym, reservation_date real1900–2099, slot_start HH:00 ou HH:00:00. Sem nome, apartamento, telefone, notas, tokens ou flags. Piscina permite00 e13–23; Academia00–23. Hora civil America/Sao_Paulo, meia-noite na própria data; duração60min. Datas/horas inexistentes no fuso rejeitadas. Limites naturais12/24, duplicatas de ID/slot rejeitadas; IDs normalizados e prefixados facilities:. Reservas ordenadas por instante inicial. Cancelamento desaparece na próxima leitura; sem cache, escrita, presença ou contagem de pessoas.

Unknown e falha têm reservedSlots=null. Somente consulta válida pode produzir zero ou número de horários reservados. Deadline limita até provider não cooperativo; abort sinalizado, timers limpos, erro técnico sanitizado. Páginas guardam facilities.read antes da consulta; enquanto desconectadas são preparação pública permitida pela configuração atual do shell.

Metadados renovados com autorização explícita do proprietário: RLS=true em reservations/active_stays, policies e views vazias. Grants observados dão escrita a postgres/service_role; não há SELECT-only demonstrado. Isso não autoriza conectar banco com credencial ampla nem criar role/view/RPC. Associação do deploy ao projeto candidato continua baseada em código/schema, não ENV lida. URL original verificada no README do snapshot auditado: https://valle-piscina-academia.vercel.app.

Antes de habilitar: comprovar identidade SELECT-only ou endpoint oficial, escopo de data/instalação, autorização Portal, projeção mínima/completude e ausência de acesso de escrita; verificar contrato em ambiente de teste. Nenhum dado operacional de produção é necessário para os contract tests atuais.
