"use client";
import { useActionState, useRef } from "react";
import { Button, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { AlertDialog } from "@/components/ui/dialog";
import { hotelDateTime } from "@/lib/hotel-time";
import type { Booking, Occurrence } from "@/modules/experiences/domain/model";
import { saveBooking, saveOccurrence } from "./actions";
const initial={error:null};
function Hidden({values}:{values:Record<string,string|number>}) { return <>{Object.entries(values).map(([name,value])=><input key={name} type="hidden" name={name} value={value} />)}</>; }
function ErrorMessage({error}:{error:string|null}) { return error?<p role="alert" aria-label="Erro na operação" className="login-error">{error}</p>:null; }
export function OccurrenceForm({request,id,experienceId,available,occurrence}:{request:string;id:string;experienceId:string;available:boolean;occurrence?:Occurrence}) {
  const [state,action,pending]=useActionState(saveOccurrence,initial);
  const prefix=`session-${id}`;
  return <form action={action} className="operation-form" aria-label={occurrence?"Editar sessão":"Nova sessão"}>
    <Hidden values={{request,id,experience_id:experienceId,version:occurrence?.version??0,action:"save"}} />
    <fieldset disabled={!available||pending}>
      <div><Label htmlFor={`${prefix}-film`}>Filme</Label><Input id={`${prefix}-film`} name="film_title" required maxLength={160} defaultValue={occurrence?.metadata.film_title??""} /></div>
      <div><Label htmlFor={`${prefix}-location`}>Local</Label><Input id={`${prefix}-location`} name="location" required maxLength={160} defaultValue={occurrence?.location??""} /></div>
      <div><Label htmlFor={`${prefix}-start`}>Início · horário de Gramado</Label><Input id={`${prefix}-start`} type="datetime-local" name="starts_at" required defaultValue={occurrence?hotelDateTime(occurrence.starts_at):""} /></div>
      <div><Label htmlFor={`${prefix}-end`}>Fim · horário de Gramado</Label><Input id={`${prefix}-end`} type="datetime-local" name="ends_at" required defaultValue={occurrence?hotelDateTime(occurrence.ends_at):""} /></div>
      <div><Label htmlFor={`${prefix}-capacity`}>Puffs disponíveis</Label><Input id={`${prefix}-capacity`} type="number" name="capacity" min={0} max={4} required defaultValue={occurrence?.capacity_override??4} /></div>
      <div><Label htmlFor={`${prefix}-people`}>Limite de adultos</Label><Input id={`${prefix}-people`} type="number" name="person_limit" min={0} max={8} required defaultValue={occurrence?.person_limit_override??8} /></div>
      <div><Label htmlFor={`${prefix}-status`}>Disponibilidade</Label><Select id={`${prefix}-status`} name="status" defaultValue={occurrence?.status??"draft"}><option value="draft">Rascunho</option><option value="published">Aberta para inscrições</option></Select></div>
      <p className="operation-help">Responsável registrado pelo login individual. Somente adultos.</p>
      <Button type="submit">{pending?"Salvando…":occurrence?"Salvar sessão":"Criar sessão"}</Button>
    </fieldset><ErrorMessage error={state.error} />
  </form>;
}
export function BookingForm({request,id,occurrenceId,available,booking}:{request:string;id:string;occurrenceId:string;available:boolean;booking?:Booking}) {
  const [state,action,pending]=useActionState(saveBooking,initial);
  const prefix=`booking-${id}`;
  return <form action={action} className="operation-form" aria-label={booking?`Editar inscrição de ${booking.guest_name}`:"Nova inscrição"}>
    <Hidden values={{request,id,occurrence_id:occurrenceId,version:booking?.version??0,action:"save"}} />
    <fieldset disabled={!available||pending}>
      <div><Label htmlFor={`${prefix}-apartment`}>Apartamento</Label><Input id={`${prefix}-apartment`} name="apartment_number" required maxLength={30} defaultValue={booking?.apartment_number??""} /></div>
      <div><Label htmlFor={`${prefix}-guest`}>Nome do hóspede</Label><Input id={`${prefix}-guest`} name="guest_name" required maxLength={160} defaultValue={booking?.guest_name??""} /></div>
      <div><Label htmlFor={`${prefix}-adults`}>Adultos</Label><Input id={`${prefix}-adults`} name="adults" type="number" min={1} max={8} required defaultValue={booking?.adults??1} /></div>
      <div><Label htmlFor={`${prefix}-status`}>Inscrição</Label><Select id={`${prefix}-status`} name="status" defaultValue={booking?.status==="confirmed"?"confirmed":"reserved"}><option value="reserved">Reservada</option><option value="confirmed">Confirmada</option></Select></div>
      <div><Label htmlFor={`${prefix}-attendance`}>Presença</Label><Select id={`${prefix}-attendance`} name="attendance_status" defaultValue={booking?.attendance_status??"pending"}><option value="pending">Ainda não registrada</option><option value="present">Presente</option><option value="absent">Ausente</option></Select></div>
      <div className="form-wide"><Label htmlFor={`${prefix}-notes`}>Observações</Label><Textarea id={`${prefix}-notes`} name="notes" maxLength={2000} defaultValue={booking?.notes??""} /></div>
      <p className="operation-help form-wide">Sem vagas para crianças. Cada reserva usa um puff para cada dois adultos, arredondando para cima.</p>
      <Button type="submit">{pending?"Salvando…":booking?.status==="cancelled"?"Reativar inscrição":booking?"Salvar inscrição":"Reservar"}</Button>
    </fieldset><ErrorMessage error={state.error} />
  </form>;
}
export function CancelForm({kind,request,id,parentId,version}:{kind:"booking"|"occurrence";request:string;id:string;parentId:string;version:number}) {
  const form=useRef<HTMLFormElement>(null);
  const [state,action,pending]=useActionState(kind==="booking"?saveBooking:saveOccurrence,initial);
  return <form ref={form} action={action}>
    <Hidden values={{request,id,version,action:"cancel",[kind==="booking"?"occurrence_id":"experience_id"]:parentId}} />
    {pending?<p role="status">Cancelando…</p>:<AlertDialog triggerLabel={kind==="booking"?"Cancelar inscrição":"Cancelar sessão"} title={kind==="booking"?"Cancelar esta inscrição?":"Cancelar esta sessão?"}
      description={kind==="booking"?"As vagas serão liberadas. O registro continuará no histórico.":"Todas as inscrições desta sessão serão canceladas e mantidas no histórico."} confirmLabel="Confirmar cancelamento" onConfirm={()=>form.current?.requestSubmit()} />}
    <ErrorMessage error={state.error} />
  </form>;
}
