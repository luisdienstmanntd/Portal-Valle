import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Card,Input,Label,Button,buttonClass } from "@/components/ui/primitives";
import { localDateSchema,hotelToday,addDays } from "@/lib/hotel-date";
import { GetDailyAgenda } from "@/modules/agenda/application/get-daily-agenda";
import { ExperienceAgendaProvider } from "@/modules/agenda/infrastructure/experience-provider";
import { DailyTimeline } from "@/modules/agenda/ui/daily-timeline";
import { ExternalSources } from "@/modules/agenda/ui/external-sources";
export const dynamic="force-dynamic";
export default async function AgendaPage({searchParams}:{searchParams:Promise<{dia?:string|string[]}>}) {
  await guardPreparationPage("portal.read");
  const params=await searchParams,parsed=localDateSchema.safeParse(params.dia),date=parsed.success?parsed.data:hotelToday(new Date());
  const agenda=await GetDailyAgenda({date,providers:[ExperienceAgendaProvider()],now:()=>new Date()});
  const previous=addDays(date,-1),next=addDays(date,1);
  return <><PageHeading title="Agenda" description="As sessões do dia, reunidas para a recepção."/>
   <Card className="operation-panel"><div className="week-toolbar">{localDateSchema.safeParse(previous).success&&<Link className={buttonClass("secondary")} href={`/agenda?dia=${previous}`}>← Dia anterior</Link>}<h2>{date.split("-").reverse().join("/")}</h2>{localDateSchema.safeParse(next).success&&<Link className={buttonClass("secondary")} href={`/agenda?dia=${next}`}>Próximo dia →</Link>}</div>
   <form className="week-selector" action="/agenda"><Label htmlFor="agenda-date">Escolher dia</Label><Input id="agenda-date" type="date" name="dia" min="1900-01-01" max="2099-12-31" defaultValue={date} required/><Button type="submit" variant="secondary">Ver dia</Button></form>
   {params.dia&&!parsed.success&&<p role="status">Data inválida. Exibindo o dia atual do hotel.</p>}<p className="operation-help">Sessões aparecem no dia em que começam. Inscrições e ocupação podem ser consultadas ao abrir a sessão.</p></Card>
   <DailyTimeline agenda={agenda}/><ExternalSources/>
  </>;
}
