import Link from "next/link";
import { Card,Badge } from "@/components/ui/primitives";
import { hotelDateTime } from "@/lib/hotel-time";
import type { DailyAgenda } from "../domain/model";
const sourceLabels={unknown:"Conexão pendente",unavailable:"Consulta indisponível",empty:"Consultado · sem sessões",available:"Consultado"};
const entryLabels={draft:"Rascunho",published:"Aberta para inscrições",cancelled:"Cancelada",completed:"Concluída"};
export function DailyTimeline({agenda}:{agenda:DailyAgenda}) {
 const knownEmpty=agenda.sources.length>0&&agenda.sources.every(s=>s.status==="empty");
 return <><div className="section-heading"><h2>Atividades do dia</h2><span>Horário de Gramado</span></div>
 <div className="agenda-sources">{agenda.sources.map(source=><Card key={source.id} className="agenda-source"><h3>{source.label}</h3><Badge tone={source.status==="unavailable"?"danger":source.status==="available"?"success":"neutral"}>{sourceLabels[source.status]}</Badge>
 {source.status==="unknown"&&<p>As sessões aparecerão após a conexão própria do Portal.</p>}
 {source.status==="unavailable"&&<p>Não foi possível consultar esta fonte. Atualize a página para tentar novamente.</p>}
 {source.fetchedAt&&<p className="operation-help">{source.status==="unavailable"?"Última tentativa":"Consultado"} às {hotelDateTime(source.fetchedAt).slice(11)}</p>}</Card>)}</div>
 {agenda.entries.length?<ol className="daily-timeline" aria-label="Atividades do dia">{agenda.entries.map(entry=><li key={entry.id}>
 <div className="timeline-time"><time dateTime={entry.start}>{hotelDateTime(entry.start).slice(11)}</time><span>até {hotelDateTime(entry.end).slice(11)}{hotelDateTime(entry.end).slice(0,10)!==agenda.date&&` · ${hotelDateTime(entry.end).slice(0,10).split("-").reverse().join("/")}`}</span></div>
 <Link className="card timeline-entry" href={entry.href}><Badge tone={entry.status==="cancelled"?"danger":"neutral"}>{entryLabels[entry.status]}</Badge><h3>{entry.title}</h3><p>{entry.experience} · {entry.location}</p><span>Ver sessão e inscrições →</span></Link>
 </li>)}</ol>:<Card className="operation-panel"><h3>{knownEmpty?"Nenhuma sessão programada neste dia":"Agenda aguardando consulta"}</h3><p>{knownEmpty?"Escolha outro dia ou confira a programação semanal.":"A ausência de atividades aqui ainda não confirma que o dia está vazio."}</p></Card>}
 </>;
}
