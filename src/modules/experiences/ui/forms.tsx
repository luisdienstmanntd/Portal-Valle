"use client";
import { useActionState, useRef } from "react";
import { Button, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { AlertDialog } from "@/components/ui/dialog";
import { hotelDateTime } from "@/lib/hotel-time";
import type { Booking, Occurrence } from "@/modules/experiences/domain/model";
import { saveBooking, saveOccurrence } from "@/app/(portal)/experiencias/actions";
import { experienceFlows, type ExperienceFlow } from "../domain/flows";
const occurrenceActions={cinema:saveOccurrence.bind(null,"cinema"),pizza:saveOccurrence.bind(null,"pizza"),program:saveOccurrence.bind(null,"program")};
const bookingActions={cinema:saveBooking.bind(null,"cinema"),pizza:saveBooking.bind(null,"pizza"),program:saveBooking.bind(null,"program")};
const initial={error:null};
function Hidden({values}:{values:Record<string,string|number>}) { return <>{Object.entries(values).map(([name,value])=><input key={name} type="hidden" name={name} value={value} />)}</>; }
function ErrorMessage({error}:{error:string|null}) { return error?<p role="alert" aria-label="Erro na operação" className="login-error">{error}</p>:null; }
export function OccurrenceForm({flow,request,id,experienceId,available,occurrence}:{flow:ExperienceFlow;request:string;id:string;experienceId:string;available:boolean;occurrence?:Occurrence}) {
  const [state,action,pending]=useActionState(occurrenceActions[flow],initial);
  const config=experienceFlows[flow];
  const prefix=`session-${id}`;
  return <form action={action} className="operation-form" aria-label={occurrence?"Editar sessão":"Nova sessão"}>
    <Hidden values={{request,id,experience_id:experienceId,version:occurrence?.version??0,action:"save"}} />
    <fieldset disabled={!available||pending}>
      <div><Label htmlFor={`${prefix}-film`}>{config.film?"Filme":"Evento"}</Label><Input id={`${prefix}-film`} name={config.film?"film_title":"title"} required maxLength={160} defaultValue={config.film?occurrence?.metadata.film_title??"":occurrence?.title_override??(flow==="program"?"":config.name)} /></div>
      <div><Label htmlFor={`${prefix}-location`}>Local</Label><Input id={`${prefix}-location`} name="location" required maxLength={160} defaultValue={occurrence?.location??""} /></div>
      <div><Label htmlFor={`${prefix}-start`}>Início · horário de Gramado</Label><Input id={`${prefix}-start`} type="datetime-local" name="starts_at" required defaultValue={occurrence?hotelDateTime(occurrence.starts_at):""} /></div>
      <div><Label htmlFor={`${prefix}-end`}>Fim · horário de Gramado</Label><Input id={`${prefix}-end`} type="datetime-local" name="ends_at" required defaultValue={occurrence?hotelDateTime(occurrence.ends_at):""} /></div>
      <div><Label htmlFor={`${prefix}-capacity`}>{config.film?"Puffs disponíveis":flow==="pizza"?"Vagas para pessoas (adultos e crianças)":"Vagas para adultos"}</Label><Input id={`${prefix}-capacity`} type="number" name="capacity" min={0} max={config.capacity} required defaultValue={occurrence?.capacity_override??(flow==="program"?12:config.capacity)} /></div>
      <div><Label htmlFor={`${prefix}-people`}>{flow==="pizza"?"Limite de pessoas":"Limite de adultos"}</Label><Input id={`${prefix}-people`} type="number" name="person_limit" min={0} max={flow==="pizza"?20:config.adults} required defaultValue={occurrence?.person_limit_override??(flow==="program"?12:flow==="pizza"?20:config.adults)} /></div>
      <div><Label htmlFor={`${prefix}-status`}>Disponibilidade</Label><Select id={`${prefix}-status`} name="status" defaultValue={occurrence?.status??"draft"}><option value="draft">Rascunho</option><option value="published">Aberta para inscrições</option></Select></div>
      <p className="operation-help">{flow==="pizza"?"Vagas incluem adultos e crianças. Limite padrão: 20 pessoas.":"Vagas contadas por adultos."}</p>
      <Button type="submit">{pending?"Salvando…":occurrence?"Salvar sessão":"Criar sessão"}</Button>
    </fieldset><ErrorMessage error={state.error} />
  </form>;
}
export function BookingForm({flow,request,id,occurrenceId,available,booking}:{flow:ExperienceFlow;request:string;id:string;occurrenceId:string;available:boolean;booking?:Booking}) {
  const [state,action,pending]=useActionState(bookingActions[flow],initial);
  const config=experienceFlows[flow];
  const prefix=`booking-${id}`;
  return <form action={action} className="operation-form" aria-label={booking?`Editar inscrição de ${booking.guest_name}`:"Nova inscrição"}>
    <Hidden values={{request,id,occurrence_id:occurrenceId,version:booking?.version??0,action:"save"}} />
    <fieldset disabled={!available||pending}>
      <div><Label htmlFor={`${prefix}-apartment`}>Apartamento</Label><Input id={`${prefix}-apartment`} name="apartment_number" required maxLength={30} defaultValue={booking?.apartment_number??""} /></div>
      <div><Label htmlFor={`${prefix}-guest`}>Nome do hóspede</Label><Input id={`${prefix}-guest`} name="guest_name" required maxLength={160} defaultValue={booking?.guest_name??""} /></div>
      <div><Label htmlFor={`${prefix}-adults`}>Adultos</Label><Input id={`${prefix}-adults`} name="adults" type="number" min={1} max={config.adults} required defaultValue={booking?.adults??1} /></div>
      {flow==="pizza"&&<div><Label htmlFor={`${prefix}-children`}>Crianças</Label><Input id={`${prefix}-children`} name="children" type="number" min={0} max={10000} required defaultValue={booking?.children??0}/></div>}
      <div><Label htmlFor={`${prefix}-status`}>Inscrição</Label><Select id={`${prefix}-status`} name="status" defaultValue={booking?.status==="confirmed"?"confirmed":"reserved"}><option value="reserved">Reservada</option><option value="confirmed">Confirmada</option></Select></div>
      <div><Label htmlFor={`${prefix}-attendance`}>Presença</Label><Select id={`${prefix}-attendance`} name="attendance_status" defaultValue={booking?.attendance_status??"pending"}><option value="pending">Ainda não registrada</option><option value="present">Presente</option><option value="absent">Ausente</option></Select></div>
      <div className="form-wide"><Label htmlFor={`${prefix}-notes`}>Observações</Label><Textarea id={`${prefix}-notes`} name="notes" maxLength={2000} placeholder="Ex.: 2 adultos; CHD 2 anos" defaultValue={booking?.notes??""} /></div>
      {flow==="pizza"&&<div className="form-wide"><Label htmlFor={`${prefix}-exception-authorized`}><input id={`${prefix}-exception-authorized`} name="exception_authorized" type="checkbox" /> Autorizar exceção ao limite de vagas</Label><Label htmlFor={`${prefix}-exception-reason`}>Justificativa da exceção (mínimo 10 caracteres)</Label><Textarea id={`${prefix}-exception-reason`} name="exception_reason" maxLength={1000} placeholder="Informe o motivo da exceção." /></div>}
      <p className="operation-help form-wide">{flow==="pizza"?"Adultos e crianças contam nas 20 vagas. Exceções exigem autorização marcada e justificativa.":"Crianças entram apenas nas observações, com a idade."} {config.film&&"Cada reserva usa um puff para cada dois adultos, arredondando para cima."}</p>
      <Button type="submit">{pending?"Salvando…":booking?.status==="cancelled"?"Reativar inscrição":booking?"Salvar inscrição":"Reservar"}</Button>
    </fieldset><ErrorMessage error={state.error} />
  </form>;
}
export function CancelForm({flow,kind,request,id,parentId,version}:{flow:ExperienceFlow;kind:"booking"|"occurrence";request:string;id:string;parentId:string;version:number}) {
  const form=useRef<HTMLFormElement>(null);
  const [state,action,pending]=useActionState(kind==="booking"?bookingActions[flow]:occurrenceActions[flow],initial);
  return <form ref={form} action={action}>
    <Hidden values={{request,id,version,action:"cancel",[kind==="booking"?"occurrence_id":"experience_id"]:parentId}} />
    {pending?<p role="status">Cancelando…</p>:<AlertDialog triggerLabel={kind==="booking"?"Cancelar inscrição":"Cancelar sessão"} title={kind==="booking"?"Cancelar esta inscrição?":"Cancelar esta sessão?"}
      description={kind==="booking"?"As vagas serão liberadas. O registro continuará no histórico.":"Todas as inscrições desta sessão serão canceladas e mantidas no histórico."} confirmLabel="Confirmar cancelamento" onConfirm={()=>form.current?.requestSubmit()} />}
    <ErrorMessage error={state.error} />
  </form>;
}
