import { randomUUID } from "node:crypto";
import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Badge,Card,Input,Label,Button,buttonClass } from "@/components/ui/primitives";
import { authConfigured,requirePermission } from "@/modules/auth/infrastructure/session";
import { can } from "@/modules/auth/domain/permissions";
import { weekRange,hotelToday,localDateSchema,addDays } from "@/modules/weekly-program/domain/week";
import { loadWeek } from "@/modules/experiences/infrastructure/queries";
import { hotelDateTime } from "@/lib/hotel-time";
import { DuplicateForm } from "@/modules/weekly-program/ui/duplicate-form";
export const dynamic="force-dynamic";
const names=["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"];
function dateLabel(value:string) {return value.split("-").reverse().join("/");}
export default async function ProgramPage({searchParams}:{searchParams:Promise<{semana?:string|string[]}>}) {
  const configured=authConfigured();
  const staff=configured?await requirePermission("experiences.read"):null;
  const params=await searchParams;
  const parsed=localDateSchema.safeParse(params.semana);
  const week=weekRange(parsed.success?parsed.data:hotelToday(new Date()));
  const data=configured?await loadWeek(week.from,week.until):null;
  const manages=can(staff,"weekly_program.manage");
  const previous=addDays(week.start,-7);
  const previousAvailable=localDateSchema.safeParse(previous).success;
  const nextAvailable=localDateSchema.safeParse(week.end).success;
  const request=randomUUID();
  return <><PageHeading title="Programação" description="As experiências da semana, no horário de Gramado."/>
    <Card className="operation-panel"><div className="week-toolbar">{previousAvailable?<Link className={buttonClass("secondary")} href={`/programacao?semana=${previous}`}>← Semana anterior</Link>:<span aria-disabled="true">Início do período disponível</span>}
    <h2>{dateLabel(week.start)} a {dateLabel(week.days[6])}</h2>{nextAvailable?<Link className={buttonClass("secondary")} href={`/programacao?semana=${week.end}`}>Próxima semana →</Link>:<span aria-disabled="true">Fim do período disponível</span>}</div>
    <form className="week-selector" action="/programacao"><Label htmlFor="week-date">Escolher data da semana</Label><Input id="week-date" type="date" name="semana" min="1900-01-01" max="2099-12-31" defaultValue={week.start} required/><Button type="submit" variant="secondary">Ver semana</Button></form>
    {params.semana&&!parsed.success&&<p role="status">Data inválida. Exibindo a semana atual do hotel.</p>}
    <p className="operation-help">Segunda a domingo. Sessões aparecem no dia em que começam, mesmo quando terminam no dia seguinte.</p></Card>
    {!configured&&<p className="operation-notice" role="status">Prévia da programação. As sessões reais aparecerão após a conexão própria do Portal. Criação e duplicação estão indisponíveis.</p>}
    <div className="week-grid">{week.days.map((day,i)=>{
      const sessions=data?.occurrences.filter(o=>hotelDateTime(o.starts_at).slice(0,10)===day)??[];
      return <Card key={day} className="week-day"><h2>{names[i]}</h2><p className="week-date">{dateLabel(day)}</p>
      {!sessions.length?<p className="operation-help">{configured?"Sem sessões programadas":"Aguardando conexão"}</p>:sessions.map(o=>{
        const experience=data!.experiences.find(e=>e.id===o.experience_id)!;
        return <Link key={o.id} className="week-session" href={`/experiencias/${experience.slug}/${o.id}`}><Badge tone={o.status==="cancelled"?"danger":"neutral"}>{({draft:"Rascunho",published:"Aberta",cancelled:"Cancelada",completed:"Concluída"})[o.status]}</Badge>
        <h3>{o.metadata.film_title??o.title_override??experience.name}</h3><p>{experience.name}</p><strong>{hotelDateTime(o.starts_at).slice(11)} · {o.location}</strong><span>Ver e gerenciar sessão →</span></Link>;
      })}</Card>;
    })}</div>
    {(manages||!configured)&&<Card className="operation-panel"><h2>Criar uma sessão</h2><p>Escolha a experiência para definir evento, local, horário e capacidade. A sessão aparecerá automaticamente na sua semana.</p>
    <div className="week-toolbar"><Link className={buttonClass("secondary")} href="/experiencias/cine-toscana">Criar sessão do Cine</Link><Link className={buttonClass("secondary")} href="/experiencias/la-vera-pizza">Criar sessão da Pizza</Link></div></Card>}
    {(manages||!configured)&&<Card className="operation-panel"><h2>Duplicar esta semana</h2><DuplicateForm key={week.start} request={request} source={week.start} target={nextAvailable?week.end:""} available={configured&&manages}/></Card>}
  </>;
}
