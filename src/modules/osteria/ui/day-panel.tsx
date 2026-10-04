import { Card, Badge, Table, buttonClass } from "@/components/ui/primitives";
import { hotelDateTime, hotelDateTimeWithSeconds } from "@/lib/hotel-time";
import type { OsteriaDay } from "../application/read-day";

export function OsteriaDayPanel({ day }: { day: OsteriaDay }) {
  return <><Card className="operation-panel"><h2>Reservas do dia · {day.date.split("-").reverse().join("/")}</h2>
    <Badge tone={day.status === "unavailable" ? "danger" : "neutral"}>{day.status === "unknown" ? "Conexão pendente" : day.status === "unavailable" ? "Consulta indisponível" : "Consultado"}</Badge>
    {day.status === "unknown" ? <p>As reservas da Osteria aparecerão quando a conexão de leitura estiver disponível. Continue utilizando a Gestão da Osteria para consultar ou alterar reservas.</p>
      : day.status === "unavailable" ? <p>Não foi possível consultar as reservas. A ausência de atividades nesta tela não confirma que o dia está vazio.</p>
      : <>{day.summary && <p>{day.summary.reservations} reservas ativas · {day.summary.adults} adultos · {day.summary.children} crianças · {day.summary.people} pessoas. Inclui {day.summary.roomService} pedidos de room service. {day.summary.cancelled} reservas canceladas fora desses totais.</p>}
        {day.status === "empty" ? <p>Nenhuma reserva encontrada nesta consulta.</p> : <Table caption="Reservas da Osteria"><thead><tr><th>Horário</th><th>Pessoas</th><th>Atendimento</th><th>Mesa</th><th>Situação</th></tr></thead><tbody>{day.reservations.map(row => <tr key={row.id}><td><time dateTime={row.start}>{hotelDateTimeWithSeconds(row.start).slice(11)}</time></td><td>{row.adults} adultos · {row.children} crianças</td><td>{row.customerType === "roomservice" ? "Room service" : "Salão"}</td><td>{row.table ?? "Não informada"}</td><td><Badge tone={row.status === "cancelled" ? "danger" : "neutral"}>{row.status === "cancelled" ? "Cancelada" : "Agendada"}</Badge></td></tr>)}</tbody></Table>}</>}
    {day.fetchedAt && <p className="operation-help">{day.status === "unavailable" ? "Última tentativa" : "Consultado"} às {hotelDateTime(day.fetchedAt).slice(11)} · Horário de Gramado</p>}
  </Card><Card className="operation-panel"><h2>Operação do restaurante</h2><p>Reservas, mesas e alterações continuam na Gestão da Osteria.</p><a className={buttonClass()} href="https://osteriadilucca.web.app/" target="_blank" rel="noopener noreferrer">Abrir Gestão da Osteria ↗</a></Card></>;
}
