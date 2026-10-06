import Link from "next/link";
import { Card, Badge, buttonClass } from "@/components/ui/primitives";
import { hotelDateTime, hotelDateTimeWithSeconds } from "@/lib/hotel-time";
import type { HomeDay } from "../application/read-home-day";

const statusLabels = { unknown: "Conexão pendente", unavailable: "Consulta indisponível", empty: "Consultado · sem atividades", available: "Consultado" };
export function HomeDayView({ day }: { day: HomeDay }) {
  const portal = day.agenda.sources[0];
  const cards = [
    { title: "Experiências Portal", href: "/agenda", ...portal,
      summary: portal.status === "available" || portal.status === "empty" ? `${day.agenda.entries.length} sessões no dia, incluindo canceladas e concluídas.` : null },
    ...[day.pool, day.gym].map(source => ({ id: source.facility, title: source.facility === "pool" ? "Piscina" : "Academia",
      href: `/${source.facility === "pool" ? "piscina" : "academia"}?dia=${day.date}`, status: source.status, fetchedAt: source.fetchedAt,
      summary: source.reservedSlots === null ? null : `${source.reservedSlots} horários reservados.` })),
    { id: "osteria", title: "Osteria", href: `/osteria?dia=${day.date}`, status: day.osteria.status, fetchedAt: day.osteria.fetchedAt,
      summary: day.osteria.summary === null ? null : `${day.osteria.summary.reservations} reservas ativas · ${day.osteria.summary.people} pessoas. Inclui ${day.osteria.summary.roomService} pedidos de room service; ${day.osteria.summary.cancelled} canceladas fora dos totais.` },
  ];
  const incomplete = cards.some(source => source.status === "unknown" || source.status === "unavailable");
  return <>
    <section aria-labelledby="home-sources-title"><div className="section-heading"><h2 id="home-sources-title">Resumo do dia</h2><span>Estado de cada fonte</span></div>
      <div className="home-sources">{cards.map(source => <Card className="home-source" key={source.id}>
        <h3>{source.title}</h3><Badge tone={source.status === "unavailable" ? "danger" : source.status === "available" ? "success" : "neutral"}>{statusLabels[source.status]}</Badge>
        <p>{source.summary ?? (source.status === "unknown" ? "Aguardando conexão. Consulte esta área no sistema responsável." : "Não foi possível consultar esta fonte. Atualize o dia para tentar novamente.")}</p>
        {source.fetchedAt && <p className="operation-help">{source.status === "unavailable" ? "Última tentativa" : "Consultado"} às {hotelDateTime(source.fetchedAt).slice(11)}</p>}
        <Link className={buttonClass("secondary")} href={source.href}>Ver {source.title === "Experiências Portal" ? "experiências" : source.title.toLowerCase()} →</Link>
      </Card>)}</div>
    </section>
    <section aria-labelledby="home-timeline-title"><div className="section-heading"><h2 id="home-timeline-title">Atividades do dia</h2><span>Horário de Gramado</span></div>
      {incomplete && <p className="home-partial" role="status">Visão parcial do dia. Fontes pendentes ou indisponíveis podem ter atividades que ainda não aparecem aqui.</p>}
      {day.nextEntry && <Card className="operation-panel"><h3>Próxima atividade consultada</h3><p><time dateTime={day.nextEntry.start}>{hotelDateTimeWithSeconds(day.nextEntry.start).slice(11)}</time> · {day.nextEntry.title}</p><Link className={buttonClass("secondary")} href={day.nextEntry.href}>Ver próxima atividade →</Link></Card>}
      {day.entries.length ? <ol className="daily-timeline" aria-label="Atividades do dia">{day.entries.map(entry => <li key={entry.id}>
        <div className="timeline-time"><time dateTime={entry.start}>{hotelDateTimeWithSeconds(entry.start).slice(11)}</time>
          {entry.end && <span>até {hotelDateTime(entry.end).slice(11)}{hotelDateTime(entry.end).slice(0, 10) !== day.date && ` · ${hotelDateTime(entry.end).slice(0, 10).split("-").reverse().join("/")}`}</span>}</div>
        <Link className="card timeline-entry" href={entry.href}><Badge tone={entry.cancelled ? "danger" : "neutral"}>{entry.status}</Badge><h3>{entry.title}</h3><p>{entry.detail}</p><span>Ver detalhes →</span></Link>
      </li>)}</ol> : <Card className="operation-panel"><h3>{incomplete ? "Agenda aguardando consulta" : "Nenhuma atividade encontrada neste dia"}</h3><p>{incomplete ? "A ausência de atividades aqui ainda não confirma que o dia está vazio." : "Todas as fontes foram consultadas. Confira os detalhes de cada área ou a programação semanal."}</p></Card>}
    </section>
  </>;
}
