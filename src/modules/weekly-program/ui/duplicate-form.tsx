"use client";
import { useActionState,useRef } from "react";
import { duplicateWeek } from "@/app/(portal)/programacao/actions";
import { Input,Label } from "@/components/ui/primitives";
import { AlertDialog } from "@/components/ui/dialog";
export function DuplicateForm({request,source,target,available}:{request:string;source:string;target:string;available:boolean}) {
  const form=useRef<HTMLFormElement>(null);
  const [state,action,pending]=useActionState(duplicateWeek,{error:null});
  return <form ref={form} action={action} className="operation-form" aria-label="Duplicar semana">
    <input type="hidden" name="request" value={request}/><input type="hidden" name="source_week" value={source}/>
    <fieldset disabled={!available||pending}><div><Label htmlFor="target-week">Segunda-feira da semana de destino</Label><Input id="target-week" name="target_week" type="date" min="1900-01-01" max="2099-12-31" required defaultValue={target}/></div>
    <p className="operation-help">Copia sessões abertas e rascunhos do Cine e da Pizza. Novas sessões ficam em rascunho, sem inscrições nem presença. O destino deve estar vazio.</p>
    {pending?<p role="status">Duplicando…</p>:<AlertDialog triggerLabel="Duplicar semana" title="Duplicar esta semana?" description="As sessões serão criadas em rascunho. Inscrições, hóspedes e presença não serão copiados." confirmLabel="Confirmar duplicação" onConfirm={()=>form.current?.requestSubmit()}/>}</fieldset>
    {state.error&&<p role="alert" className="login-error">{state.error}</p>}
  </form>;
}
