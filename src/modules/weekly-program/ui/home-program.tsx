import Link from "next/link";
import { Card, Badge, buttonClass } from "@/components/ui/primitives";
import { weekRange } from "../domain/week";
import { hotelDateTime } from "@/lib/hotel-time";
import { loadWeek } from "@/modules/experiences/infrastructure/queries";
import { authConfigured } from "@/modules/auth/infrastructure/session";
const names=["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"];
export async function HomeProgram({ date }: { date: string }) {
  const week=weekRange(date);
  const configured=authConfigured();
  let data:Awaited<ReturnType<typeof loadWeek>>|null=null;
  let failed=false;
  if(configured) { try { data=await loadWeek(week.from,week.until); } catch { failed=true; } }
  const sessions=data?.occurrences.filter(o=>o.status==="published"||o.status==="completed")??[];
  const todays=sessions.filter(o=>hotelDateTime(o.starts_at).slice(0,10)===date);
  const dateLabel=(value:string)=>value.split("-").reverse().join("/");
  function activity(o:typeof sessions[number]) {
    const experience=data!.experiences.find(e=>e.id===o.experience_id)!;
    return <li key={o.id}><strong>{hotelDateTime(o.starts_at).slice(11)} às {hotelDateTime(o.ends_at).slice(11)}</strong><Link href={`/experiencias/${experience.slug}/${o.id}`}>{o.metadata.film_title??o.title_override??experience.name} · {o.location}</Link></li>;
  }
  const pending=failed?"Não foi possível carregar a programação. Atualize a página para tentar novamente.":"A programação cadastrada pela equipe aparecerá aqui quando o acesso do Portal estiver conectado.";
  return <Card className="hotel-program" data-testid="hotel-program">
    <div className="hotel-program-heading"><div><p className="eyebrow">PROGRAMAÇÃO DO HOTEL</p><h2>O que acontece hoje</h2></div><Badge>{dateLabel(date)}</Badge></div>
    {!data?<p role="status" className="operation-notice">{pending}</p>:todays.length?<ul className="program-today">{todays.map(activity)}</ul>:<p>Nenhuma atividade publicada para hoje.</p>}
    <div className="section-heading"><h3>Esta semana</h3><span>{dateLabel(week.start)} a {dateLabel(week.days[6])}</span></div>
    <div className="hotel-program-days">{week.days.map((day,i)=>{
      const activities=sessions.filter(o=>hotelDateTime(o.starts_at).slice(0,10)===day);
      return <details key={day} className="hotel-program-day" open={day===date}><summary><span>{names[i]}</span><span>{dateLabel(day)}</span></summary>
        {!data?<p>Programação indisponível.</p>:activities.length?<ul>{activities.map(activity)}</ul>:<p>Nenhuma atividade publicada.</p>}
      </details>;
    })}</div>
    <p className="operation-help">Horário de Gramado. Abra uma atividade para consultar vagas e inscrições.</p>
    <Link href="/programacao" className={buttonClass("secondary")}>Cadastrar e organizar a semana</Link>
  </Card>;
}
