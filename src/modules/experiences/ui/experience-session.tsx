import { randomUUID } from "node:crypto";
import { z } from "zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, Badge, buttonClass } from "@/components/ui/primitives";
import { authConfigured, requirePermission } from "@/modules/auth/infrastructure/session";
import { can } from "@/modules/auth/domain/permissions";
import { loadExperienceSession } from "../infrastructure/queries";
import {experienceFlows,type ExperienceFlow} from "../domain/flows";
import { summarizeCapacity } from "@/modules/experiences/domain/capacity";
import { hotelDateTime } from "@/lib/hotel-time";
import { BookingForm, CancelForm, OccurrenceForm } from "./forms";
export async function ExperienceSession({flow,params}:{flow:ExperienceFlow;params:Promise<{id:string}>}) {
  const config=experienceFlows[flow];
  if(!authConfigured()) notFound();
  const staff=await requirePermission("experiences.read");
  const {id}=await params;
  if(!z.uuid().safeParse(id).success) notFound();
  const data=await loadExperienceSession(flow,id); if(!data) notFound();
  const {experience,occurrence:o,bookings}=data;
  const policyPending=bookings.some(b=>b.status==="no_show");
  const occupancy=policyPending?null:summarizeCapacity(experience,o,bookings,{countChildren:false,noShowConsumesCapacity:true});
  const manager=can(staff,"experiences.manage");
  const booker=can(staff,"bookings.manage");
  const request=randomUUID();
  return <><PageHeading title={o.metadata.film_title??o.title_override??config.name} description={`${hotelDateTime(o.starts_at).replace("T"," · ")} · ${o.location}`} />
    <Card className="experience-intro"><Badge>{({draft:"Rascunho",published:"Aberta para inscrições",cancelled:"Cancelada",completed:"Concluída"})[o.status]}</Badge><h2>{occupancy?`${occupancy.used} / ${occupancy.capacity} ${config.unit}${config.film?` · ${occupancy.persons} / ${occupancy.personLimit} adultos`:""}`:"Ocupação precisa de revisão"}</h2><p>Vagas contadas por adultos; crianças nas observações. Responsável e alterações registrados pelo login individual.</p></Card>
    {manager&&o.status!=="cancelled"&&<Card className="operation-panel"><details><summary>Editar sessão</summary><OccurrenceForm flow={flow} key={request} request={request} id={id} experienceId={experience.id} available={true} occurrence={o} /></details><CancelForm flow={flow} kind="occurrence" request={randomUUID()} id={id} parentId={experience.id} version={o.version} /></Card>}
    {booker&&o.status==="published"&&!policyPending&&<Card className="operation-panel"><h2>Nova inscrição</h2><BookingForm flow={flow} key={request} request={request} id={randomUUID()} occurrenceId={id} available={true} /></Card>}
    <section className="experience-section"><h2>Inscrições</h2>{!bookings.length?<p>Nenhuma inscrição nesta sessão.</p>:bookings.map(b=><Card key={b.id} className="operation-panel"><h3>{b.guest_name} · Apto {b.apartment_number}</h3><p>{b.adults} adultos{config.film&&` · ${b.units} puffs`}</p><p>{({reserved:"Reservada",confirmed:"Confirmada",cancelled:"Cancelada",no_show:"Não compareceu"})[b.status]} · {({pending:"Presença pendente",present:"Presente",absent:"Ausente"})[b.attendance_status]}</p>{b.notes&&<p>Observações: {b.notes}</p>}
      {booker&&o.status==="published"&&!policyPending&&<details><summary>{b.status==="cancelled"?"Reativar inscrição":"Editar inscrição e presença"}</summary><BookingForm flow={flow} key={`${request}-${b.id}`} request={randomUUID()} id={b.id} occurrenceId={id} available={true} booking={b} /></details>}
      {booker&&b.status!=="cancelled"&&<CancelForm flow={flow} kind="booking" request={randomUUID()} id={b.id} parentId={id} version={b.version} />}
    </Card>)}</section><Link className={buttonClass("secondary")} href={`/experiencias/${config.slug}`}>Voltar para {config.name}</Link>
  </>;
}
