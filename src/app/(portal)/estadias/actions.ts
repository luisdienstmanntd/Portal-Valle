"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/infrastructure/session";
import { createPortalServerClient } from "@/lib/supabase/server";
import { createStayCommandSchema, linkBookingStayCommandSchema, linkOperationError, stayOperationError } from "@/modules/stays/domain/commands";
export type StayOperationState = { error: string | null };
export async function createStay(_state: StayOperationState, form: FormData): Promise<StayOperationState> {
  await requirePermission("stays.manage");
  const field = (name: string) => String(form.get(name) ?? "");
  const request = z.uuid().safeParse(field("request"));
  const command = createStayCommandSchema.safeParse({ id: field("id"), apartment: field("apartment"), arrivalDate: field("arrivalDate"), departureDate: field("departureDate") });
  if (!request.success || !command.success) return { error: stayOperationError("E_INPUT") };
  const client = await createPortalServerClient();
  const { data, error } = await client.rpc("portal_create_stay", { p_request: request.data, p_command: {
    id: command.data.id, apartment: command.data.apartment, arrival_date: command.data.arrivalDate, departure_date: command.data.departureDate,
  } });
  if (error || !data) return { error: stayOperationError(error?.message ?? "") };
  revalidatePath("/estadias");
  redirect(`/estadias/${data}`);
}
export async function linkBookingToStay(stayPath: string, form: FormData): Promise<void> {
  await requirePermission("bookings.manage");
  await requirePermission("stays.read");
  const field = (name: string) => String(form.get(name) ?? "");
  const request = z.uuid().safeParse(field("request"));
  const command = linkBookingStayCommandSchema.safeParse({
    bookingId: field("bookingId"), version: Number(field("version")), stayId: field("stayId") || null,
  });
  const target = z.uuid().safeParse(stayPath);
  if (!request.success || !command.success || !target.success) redirect(`/estadias?erro=${encodeURIComponent(linkOperationError("E_INPUT"))}`);
  const client = await createPortalServerClient();
  const { error } = await client.rpc("portal_link_booking_stay", { p_request: request.data, p_command: {
    booking_id: command.data.bookingId, version: command.data.version, stay_id: command.data.stayId,
  } });
  revalidatePath(`/estadias/${target.data}`);
  if (error) redirect(`/estadias/${target.data}?erro=${encodeURIComponent(linkOperationError(error.message))}`);
  redirect(`/estadias/${target.data}`);
}
