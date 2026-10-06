"use client";
import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui/primitives";
import { createStay } from "@/app/(portal)/estadias/actions";
export function StayForm({ available, id, request }: { available: boolean; id: string; request: string }) {
  const [state, action, pending] = useActionState(createStay, { error: null });
  return <form action={action} aria-label="Cadastrar estadia" className="operation-form">
    <input type="hidden" name="id" value={id}/><input type="hidden" name="request" value={request}/>
    <fieldset disabled={!available || pending} className="stay-fields"><legend>Dados da estadia</legend>
      <div><Label htmlFor="stay-apartment">Apartamento</Label><Input id="stay-apartment" name="apartment" required maxLength={30}/></div>
      <div><Label htmlFor="stay-arrival">Entrada</Label><Input id="stay-arrival" name="arrivalDate" type="date" required min="1900-01-01" max="2099-12-31"/></div>
      <div><Label htmlFor="stay-departure">Saída</Label><Input id="stay-departure" name="departureDate" type="date" required min="1900-01-01" max="2099-12-31"/></div>
      <Button type="submit">{pending ? "Cadastrando…" : "Cadastrar estadia"}</Button>
    </fieldset>
    {state.error && <p role="alert" className="login-error">{state.error}</p>}
  </form>;
}
