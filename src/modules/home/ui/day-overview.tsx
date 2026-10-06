import Link from "next/link";
import { Card, Badge, buttonClass } from "@/components/ui/primitives";
import { hotelDateTime, hotelDateTimeWithSeconds } from "@/lib/hotel-time";
import type { HotelDay } from "../application/get-hotel-day";
const labels = { unknown: "Conexão pendente", unavailable: "Consulta indisponível", empty: "Consultado · sem atividades", available: "Consultado" };
export function DayOverview({ day }: { day: HotelDay }) {
  const empty = day.sources.length > 0 && day.sources.every(source => source.status === "empty");
  return <><div className="section-heading"><h2>O hotel hoje</h2><span>Estado das consultas</span></div>
    <div className="home-sources">{day.sources.map(source => <Card className="home-source" key={source.id} data-testid={`home-source-${source.id}`}><h3>{source.label}</h3><Badge tone={source.status === "unavailable" ? "danger" : source.status === "available" ? "success" : "neutral"}>{labels[source.status]}</Badge>
      <p>{source.summary ?? (source.status === "unknown" ? "A consulta desta área ainda não está conectada." : "Não foi possível consultar esta área. Atualize o dia para tentar novamente.")}</p>
      {source.fetchedAt && <p className="operation-help">{source.status === "unavailable" ? "Última tentativa" : "Consultado"} às {hotelDateTime(source.fetchedAt).slice(11)}</p>}
      <Link className={buttonClass("secondary")} href={source.href}>Ver {source.label} →</Link></Card>)}</div>
    <div className="section-heading"><h2>Atividades do dia</h2><span>Horário de Gramado</span></div>
    {day.entries.length ? <ol className="daily-timeline" aria-label="Atividades do dia">{day.entries.map(entry => <li key={entry.id}><div className="timeline-time"><time dateTime={entry.start}>{hotelDateTimeWithSeconds(entry.start).slice(11)}</time>
      {entry.end && <span>até {hotelDateTime(entry.end).slice(11)}{hotelDateTime(entry.end).slice(0,10) !== day.date && ` · ${hotelDateTime(entry.end).slice(0,10).split("-").reverse().join("/")}`}</span>}</div>
      <Link className="card timeline-entry" href={entry.href}><Badge tone={entry.cancelled ? "danger" : "neutral"}>{entry.state}</Badge><h3>{entry.title}</h3><p>{entry.detail}</p><span>Abrir atividade →</span></Link></li>)}</ol>
      : <Card className="operation-panel"><h3>{empty ? "Nenhuma atividade encontrada neste dia" : "Agenda aguardando consulta"}</h3><p>{empty ? "Todas as áreas foram consultadas. Confira também a programação semanal." : "Áreas com conexão pendente ou consulta indisponível ainda não confirmam que o dia está vazio."}</p></Card>}
  </>;
}
