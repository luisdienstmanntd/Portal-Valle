import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { hotelToday } from "@/lib/hotel-date";
import { ExperienceAgendaProvider } from "@/modules/agenda/infrastructure/experience-provider";
import { can } from "@/modules/auth/domain/permissions";
import { GetHotelDay } from "@/modules/home/application/get-hotel-day";
import { DayOverview } from "@/modules/home/ui/day-overview";
import { HotelProgramNotice } from "@/modules/home/ui/hotel-program-notice";
import { facilitiesReader } from "@/modules/facilities/infrastructure/reader";
import { osteriaReader } from "@/modules/osteria/infrastructure/reader";
export const dynamic="force-dynamic";

export default async function TodayPage() {
  const staff = await guardPreparationPage();
  const date=hotelToday(new Date());
  const day = await GetHotelDay({ date, portalProviders: !staff || can(staff,"experiences.read") ? [ExperienceAgendaProvider()] : [],
    facilities: can(staff,"facilities.read") ? facilitiesReader() : null, osteria: can(staff,"osteria.read") ? osteriaReader() : null, now: () => new Date() });
  return <>
    <PageHeading title="Hoje" description={`Seu dia no Valle · ${date.split("-").reverse().join("/")}`} action={<form action="/hoje"><Button type="submit" variant="secondary">Atualizar dia</Button></form>}/>
    <HotelProgramNotice startDate="2026-10-09" today={date}/>
    <DayOverview day={day}/>
    <div className="section-heading"><h2>Explore o Portal</h2><span>Visão geral</span></div>
    <div className="quick-links">
      <Link href="/agenda" className="quick-card"><span className="quick-icon"><Icon name="calendar" /></span><div><h3>Agenda</h3><p>As atividades do dia em uma visão única.</p></div><Icon name="arrow" /></Link>
      <Link href="/programacao" className="quick-card"><span className="quick-icon"><Icon name="week" /></span><div><h3>Programação</h3><p>Uma visão da semana e seus encontros.</p></div><Icon name="arrow" /></Link>
    </div>
  </>;
}
