import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Badge, Card, Table } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";

export default async function TodayPage() {
  await guardPreparationPage();
  return <>
    <PageHeading title="Hoje" description="Seu dia no Valle, em um só lugar." />
    <Card className="welcome-card"><div><p className="eyebrow">BEM-VINDO AO PORTAL</p><h2>Mais tempo para acolher.</h2><p>Um espaço para acompanhar a programação e as experiências do hotel. As áreas estão sendo preparadas para o dia a dia da recepção.</p></div><Icon name="sparkles" width={72} height={72} /></Card>
    <div className="section-heading"><h2>Explore o Portal</h2><span>Visão geral</span></div>
    <div className="quick-links">
      <Link href="/agenda" className="quick-card"><span className="quick-icon"><Icon name="calendar" /></span><div><h3>Agenda</h3><p>As atividades do dia em uma visão única.</p></div><Icon name="arrow" /></Link>
      <Link href="/programacao" className="quick-card"><span className="quick-icon"><Icon name="week" /></span><div><h3>Programação</h3><p>Uma visão da semana e seus encontros.</p></div><Icon name="arrow" /></Link>
    </div>
    <Card className="sources-card"><div className="sources-heading"><div><h2>Áreas do hotel</h2><p>As informações destas áreas ainda não estão disponíveis no Portal.</p></div><Badge>Em preparação</Badge></div>
      <Table caption="Disponibilidade das áreas no Portal"><thead><tr><th scope="col">Área</th><th scope="col">Situação no Portal</th><th scope="col"><span className="sr-only">Navegação</span></th></tr></thead><tbody>
        {[{ title: "Experiências", href: "/experiencias", detail: "Encontros e momentos no Valle" }, { title: "Piscina", href: "/piscina", detail: "Bem-estar e descanso" }, { title: "Academia", href: "/academia", detail: "Movimento e equilíbrio" }, { title: "Osteria", href: "/osteria", detail: "À mesa na Osteria Di Lucca" }].map(area => <tr key={area.href}><th scope="row"><span>{area.title}</span><small>{area.detail}</small></th><td><Badge>Em preparação</Badge></td><td><Link href={area.href} className="table-link" aria-label={`Acessar ${area.title}`}><Icon name="arrow" /></Link></td></tr>)}
      </tbody></Table>
    </Card>
  </>;
}
