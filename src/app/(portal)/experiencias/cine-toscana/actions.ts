"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/infrastructure/session";
import { createPortalServerClient } from "@/lib/supabase/server";
import { hotelDateTimeToInstant } from "@/lib/hotel-time";
import { bookingCommandSchema, occurrenceCommandSchema, operationError } from "@/modules/experiences/domain/commands";
export type OperationState={error:string|null};
function field(form:FormData,name:string) { return String(form.get(name)??""); }
function number(form:FormData,name:string) { const raw=field(form,name); return raw.trim()===""?NaN:Number(raw); }
function refresh(id:string) { revalidatePath("/experiencias/cine-toscana"); revalidatePath(`/experiencias/cine-toscana/${id}`); }
export async function saveOccurrence(_state:OperationState,form:FormData):Promise<OperationState> {
  await requirePermission("experiences.manage");
  const req=z.uuid().safeParse(field(form,"request"));
  let command;
  try {
    const base={action:field(form,"action"),id:field(form,"id"),version:number(form,"version"),experience_id:field(form,"experience_id")};
    command=occurrenceCommandSchema.safeParse(base.action==="cancel"?base:{...base,
      starts_at:hotelDateTimeToInstant(field(form,"starts_at")),ends_at:hotelDateTimeToInstant(field(form,"ends_at")),
      location:field(form,"location"),film_title:field(form,"film_title"),capacity:number(form,"capacity"),person_limit:number(form,"person_limit"),status:field(form,"status")});
  } catch { return {error:operationError("E_INPUT")}; }
  if(!req.success||!command.success) return {error:operationError("E_INPUT")};
  const client=await createPortalServerClient();
  const {data,error}=await client.rpc("portal_save_occurrence",{p_request:req.data,p_command:command.data});
  if(error||!data) return {error:operationError(error?.message??"")};
  refresh(data); redirect(`/experiencias/cine-toscana/${data}`);
}
export async function saveBooking(_state:OperationState,form:FormData):Promise<OperationState> {
  await requirePermission("bookings.manage");
  const req=z.uuid().safeParse(field(form,"request"));
  const base={action:field(form,"action"),id:field(form,"id"),version:number(form,"version"),occurrence_id:field(form,"occurrence_id")};
  const command=bookingCommandSchema.safeParse(base.action==="cancel"?base:{...base,adults:number(form,"adults"),children:0,
    apartment_number:field(form,"apartment_number"),guest_name:field(form,"guest_name"),notes:field(form,"notes"),status:field(form,"status"),attendance_status:field(form,"attendance_status")});
  if(!req.success||!command.success) return {error:operationError("E_INPUT")};
  const client=await createPortalServerClient();
  const {data,error}=await client.rpc("portal_save_booking",{p_request:req.data,p_command:command.data});
  if(error||!data) return {error:operationError(error?.message??"")};
  refresh(command.data.occurrence_id); redirect(`/experiencias/cine-toscana/${command.data.occurrence_id}`);
}
