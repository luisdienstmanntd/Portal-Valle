import { randomUUID } from "node:crypto";
import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, Badge, buttonClass } from "@/components/ui/primitives";
import { authConfigured, requirePermission } from "@/modules/auth/infrastructure/session";
import { can } from "@/modules/auth/domain/permissions";
import { loadExperience } from "../infrastructure/queries";
import {experienceFlows,type ExperienceFlow} from "../domain/flows";
import { hotelDateTime } from "@/lib/hotel-time";
import { OccurrenceForm } from "./forms";
export async function ExperienceList({flow}:{flow:ExperienceFlow}) {
  const config=experienceFlows[flow];
  const configured=authConfigured();
  const staff=configured?await requirePermission("experiences.read"):null;
  const data=configured?await loadExperience(flow):null;
  const manages=can(staff,"experiences.manage");
  const request=randomUUID();
  return <><PageHeading title={config.name} description={config.description} />
    <Card className="experience-intro"><Badge>{flow==="pizza"?"Vagas por pessoas":"Vagas por adultos"}</Badge><h2>{config.film?"8 adultos · 4 puffs de casal":flow==="pizza"?"20 pessoas · adultos e crianças":"Vagas definidas em cada atividade"}</h2><p>{flow==="pizza"?"Acima do limite, recepção ou gerência deve autorizar a exceção com justificativa.":"Crianças são registradas nas observações, com a idade, sem entrar na contagem de vagas."}</p></Card>
    {!configured&&<p className="operation-notice" role="status">Prévia da interface. As inscrições ficam indisponíveis até a conexão própria do Portal estar preparada.</p>}
    <section className="experience-section"><h2>Sessões</h2>
      {!data?.occurrences.length?<Card className="operation-panel"><h3>Nenhuma sessão programada</h3><p>Local e horário aparecerão aqui quando uma sessão for criada.</p></Card>:<div className="session-grid">{data.occurrences.map(o=><Link key={o.id} className="card session-card" href={`/experiencias/${config.slug}/${o.id}`}><Badge tone={o.status==="cancelled"?"danger":"neutral"}>{({draft:"Rascunho",published:"Aberta",cancelled:"Cancelada",completed:"Concluída"})[o.status]}</Badge><h3>{o.metadata.film_title??o.title_override??config.name}</h3><p>{hotelDateTime(o.starts_at).replace("T"," · ")}</p><p>{o.location}</p><span>Ver sessão →</span></Link>)}</div>}
    </section>
    {(manages||!configured)&&<Card className="operation-panel"><h2>Nova sessão</h2><OccurrenceForm flow={flow} key={request} request={request} id={randomUUID()} experienceId={data?.experience.id??(flow==="program"?"c7000000-0000-4000-8000-000000000001":config.film?"c1000000-0000-4000-8000-000000000001":"c8000000-0000-4000-8000-000000000001")} available={configured&&manages} /></Card>}
    <Link className={buttonClass("secondary")} href="/experiencias">Voltar para Experiências</Link>
  </>;
}
