"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/modules/auth/infrastructure/session";
import { createPortalServerClient } from "@/lib/supabase/server";
import { duplicateWeekSchema } from "@/modules/weekly-program/domain/week";
import { operationError } from "@/modules/experiences/domain/commands";
export async function duplicateWeek(_state:{error:string|null},form:FormData):Promise<{error:string|null}> {
  await requirePermission("weekly_program.manage");
  const req=z.uuid().safeParse(form.get("request"));
  const command=duplicateWeekSchema.safeParse({source_week:form.get("source_week"),target_week:form.get("target_week")});
  if(!req.success||!command.success) return {error:operationError("E_INPUT")};
  const client=await createPortalServerClient();
  const {data,error}=await client.rpc("portal_duplicate_week",{p_request:req.data,p_command:command.data});
  if(error||!data) return {error:({E_EMPTY_WEEK:"Esta semana não tem sessões abertas ou em rascunho para copiar.",E_WEEK_OCCUPIED:"A semana de destino já contém sessões. Escolha outra semana.",E_WEEK_LIMIT:"Esta semana excede o limite de 100 sessões para duplicação."} as Record<string,string>)[error?.message??""]??operationError(error?.message??"")};
  revalidatePath("/programacao"); revalidatePath("/experiencias/cine-toscana"); revalidatePath("/experiencias/la-vera-pizza");
  redirect(`/programacao?semana=${command.data.target_week}&duplicada=1`);
}
