import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Card,Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { hotelToday } from "@/lib/hotel-date";
import { GetDailyAgenda } from "@/modules/agenda/application/get-daily-agenda";
import { ExperienceAgendaProvider } from "@/modules/agenda/infrastructure/experience-provider";
import { DailyTimeline } from "@/modules/agenda/ui/daily-timeline";
import { ExternalSources } from "@/modules/agenda/ui/external-sources";
export const dynamic="force-dynamic";

export default async function TodayPage() {
  await guardPreparationPage();
  const date=hotelToday(new Date());
  const agenda=await GetDailyAgenda({date,providers:[ExperienceAgendaProvider()],now:()=>new Date()});
  return <>
    <PageHeading title="Hoje" description={`Seu dia no Valle · ${date.split("-").reverse().join("/")}`} action={<form action="/hoje"><Button type="submit" variant="secondary">Atualizar dia</Button></form>}/>
    <Card className="welcome-card"><div><p className="eyebrow">BEM-VINDO AO PORTAL</p><h2>Mais tempo para acolher.</h2><p>A programação e as experiências do hotel, reunidas para o dia a dia da recepção.</p></div><Icon name="sparkles" width={72} height={72} /></Card>
    <DailyTimeline agenda={agenda}/>
    <div className="section-heading"><h2>Explore o Portal</h2><span>Visão geral</span></div>
    <div className="quick-links">
      <Link href="/agenda" className="quick-card"><span className="quick-icon"><Icon name="calendar" /></span><div><h3>Agenda</h3><p>As atividades do dia em uma visão única.</p></div><Icon name="arrow" /></Link>
      <Link href="/programacao" className="quick-card"><span className="quick-icon"><Icon name="week" /></span><div><h3>Programação</h3><p>Uma visão da semana e seus encontros.</p></div><Icon name="arrow" /></Link>
    </div>
    <ExternalSources/>
  </>;
}
