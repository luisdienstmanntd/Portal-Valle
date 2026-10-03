import { randomUUID } from "node:crypto";
import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, Badge, buttonClass } from "@/components/ui/primitives";
import { authConfigured, requirePermission } from "@/modules/auth/infrastructure/session";
import { can } from "@/modules/auth/domain/permissions";
import { loadCinema } from "@/modules/experiences/infrastructure/cinema";
import { hotelDateTime } from "@/lib/hotel-time";
import { OccurrenceForm } from "./forms";
export default async function CinemaPage() {
  const configured=authConfigured();
  const staff=configured?await requirePermission("experiences.read"):null;
  const data=configured?await loadCinema():null;
  const manages=can(staff,"experiences.manage");
  const request=randomUUID();
  return <><PageHeading title="Cine Toscana" description="Um encontro para desacelerar e apreciar um bom filme." />
    <Card className="experience-intro"><Badge>Somente adultos</Badge><h2>8 pessoas · 4 puffs de casal</h2><p>As inscrições respeitam os lugares e os puffs disponíveis em cada sessão.</p></Card>
    {!configured&&<p className="operation-notice" role="status">Prévia da interface. As inscrições ficam indisponíveis até a conexão própria do Portal estar preparada.</p>}
    <section className="experience-section"><h2>Sessões</h2>
      {!data?.occurrences.length?<Card className="operation-panel"><h3>Nenhuma sessão programada</h3><p>Filme, local e horário aparecerão aqui quando uma sessão for criada.</p></Card>:<div className="session-grid">{data.occurrences.map(o=><Link key={o.id} className="card session-card" href={`/experiencias/cine-toscana/${o.id}`}><Badge tone={o.status==="cancelled"?"danger":"neutral"}>{({draft:"Rascunho",published:"Aberta",cancelled:"Cancelada",completed:"Concluída"})[o.status]}</Badge><h3>{o.metadata.film_title??"Sessão de cinema"}</h3><p>{hotelDateTime(o.starts_at).replace("T"," · ")}</p><p>{o.location}</p><span>Ver sessão →</span></Link>)}</div>}
    </section>
    {(manages||!configured)&&<Card className="operation-panel"><h2>Nova sessão</h2><OccurrenceForm key={request} request={request} id={randomUUID()} experienceId={data?.experience.id??"c1000000-0000-4000-8000-000000000001"} available={configured&&manages} /></Card>}
    <Link className={buttonClass("secondary")} href="/experiencias">Voltar para Experiências</Link>
  </>;
}
