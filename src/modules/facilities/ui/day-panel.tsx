import { Card, Badge, buttonClass } from "@/components/ui/primitives";
import { hotelDateTime } from "@/lib/hotel-time";
import type { FacilityDay } from "../application/read-day";

export function FacilityDayPanel({ day }: { day: FacilityDay }) {
  const label = day.facility === "pool" ? "Piscina" : "Academia";
  return <><Card className="operation-panel"><h2>Reservas do dia · {day.date.split("-").reverse().join("/")}</h2>
    <Badge tone={day.status === "unavailable" ? "danger" : "neutral"}>{day.status === "unknown" ? "Conexão pendente" : day.status === "unavailable" ? "Consulta indisponível" : "Consultado"}</Badge>
    {day.status === "unknown" ? <p>As reservas da {label.toLowerCase()} aparecerão quando a conexão de leitura estiver disponível. Para consultar ou reservar horários, continue utilizando o sistema de Piscina e Academia.</p>
      : day.status === "unavailable" ? <p>Não foi possível consultar as reservas. A ausência de horários nesta tela não confirma disponibilidade.</p>
      : <><p>{day.reservedSlots} horários reservados neste dia.</p>{day.status === "empty" ? <p>Nenhuma reserva encontrada nesta consulta.</p> : <ol>{day.reservations.map(row => <li key={row.id}><time dateTime={row.start}>{hotelDateTime(row.start).slice(11)}</time> até {hotelDateTime(row.end).slice(11)}{hotelDateTime(row.end).slice(0,10) !== day.date && ` · ${hotelDateTime(row.end).slice(0,10).split("-").reverse().join("/")}`}</li>)}</ol>}</>}
    {day.fetchedAt && <p className="operation-help">{day.status === "unavailable" ? "Última tentativa" : "Consultado"} às {hotelDateTime(day.fetchedAt).slice(11)} · Horário de Gramado</p>}
  </Card><Card className="operation-panel"><h2>Consultar no sistema atual</h2><p>As reservas e alterações continuam no sistema de Piscina e Academia.</p><a className={buttonClass()} href="https://valle-piscina-academia.vercel.app" target="_blank" rel="noopener noreferrer">Abrir Piscina e Academia ↗</a></Card></>;
}
