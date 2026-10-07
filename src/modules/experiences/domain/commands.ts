import { z } from "zod";
const identity = { id:z.uuid(), version:z.number().int().min(0) };
const text = (max:number) => z.string().trim().min(1).max(max);
export const occurrenceCommandSchema = z.discriminatedUnion("action", [
  z.object({ action:z.literal("save"), ...identity, experience_id:z.uuid(), starts_at:z.iso.datetime({offset:true}), ends_at:z.iso.datetime({offset:true}),
    location:text(160), film_title:text(160), capacity:z.number().int().min(0).max(4), person_limit:z.number().int().min(0).max(8), status:z.enum(["draft","published"]) }).strict(),
  z.object({ action:z.literal("cancel"), ...identity, experience_id:z.uuid() }).strict(),
]).refine(v => v.action === "cancel" || Date.parse(v.ends_at)>Date.parse(v.starts_at), {message:"Fim deve ser posterior ao início."});
export const bookingCommandSchema = z.discriminatedUnion("action", [
  z.object({ action:z.literal("save"), ...identity, occurrence_id:z.uuid(), adults:z.number().int().min(1).max(8), children:z.literal(0),
    apartment_number:text(30), guest_name:text(160), notes:z.string().max(2000), status:z.enum(["reserved","confirmed"]), attendance_status:z.enum(["pending","present","absent"]) }).strict(),
  z.object({ action:z.literal("cancel"), ...identity, occurrence_id:z.uuid() }).strict(),
]);
export const pizzaOccurrenceCommandSchema = z.discriminatedUnion("action", [
  z.object({ action:z.literal("save"), ...identity, experience_id:z.uuid(), starts_at:z.iso.datetime({offset:true}), ends_at:z.iso.datetime({offset:true}),
    location:text(160), title:text(160), capacity:z.number().int().min(0).max(20), person_limit:z.number().int().min(0).max(20), status:z.enum(["draft","published"]) }).strict(),
  z.object({ action:z.literal("cancel"), ...identity, experience_id:z.uuid() }).strict(),
]).refine(v=>v.action==="cancel"||Date.parse(v.ends_at)>Date.parse(v.starts_at),{message:"Fim deve ser posterior ao início."});
export const pizzaBookingCommandSchema = z.discriminatedUnion("action", [
  z.object({ action:z.literal("save"), ...identity, occurrence_id:z.uuid(), adults:z.number().int().min(1).max(10000), children:z.number().int().min(0).max(10000),
    apartment_number:text(30), guest_name:text(160), notes:z.string().max(2000), status:z.enum(["reserved","confirmed"]), attendance_status:z.enum(["pending","present","absent"]), exception_reason:z.string().trim().max(1000).default("") }).strict(),
  z.object({ action:z.literal("cancel"), ...identity, occurrence_id:z.uuid() }).strict(),
]).refine(v=>v.action==="cancel"||v.adults+v.children<=20||v.exception_reason.length>=10,{message:"Acima de 20 pessoas, informe a justificativa da exceção."});
export const programOccurrenceCommandSchema = z.discriminatedUnion("action", [
  z.object({ action:z.literal("save"), ...identity, experience_id:z.uuid(), starts_at:z.iso.datetime({offset:true}), ends_at:z.iso.datetime({offset:true}),
    location:text(160), title:text(160), capacity:z.number().int().min(0).max(10000), person_limit:z.number().int().min(0).max(10000), status:z.enum(["draft","published"]) }).strict(),
  z.object({ action:z.literal("cancel"), ...identity, experience_id:z.uuid() }).strict(),
]).refine(v=>v.action==="cancel"||Date.parse(v.ends_at)>Date.parse(v.starts_at),{message:"Fim deve ser posterior ao início."});
export const programBookingCommandSchema = z.discriminatedUnion("action", [
  z.object({ action:z.literal("save"), ...identity, occurrence_id:z.uuid(), adults:z.number().int().min(1).max(10000), children:z.literal(0),
    apartment_number:text(30), guest_name:text(160), notes:z.string().max(2000), status:z.enum(["reserved","confirmed"]), attendance_status:z.enum(["pending","present","absent"]), exception_reason:z.string().trim().max(1000).default("") }).strict(),
  z.object({ action:z.literal("cancel"), ...identity, occurrence_id:z.uuid() }).strict(),
]);
export function requiredPuffs(adults:number) { return Math.ceil(z.number().int().min(1).max(8).parse(adults)/2); }
export function operationError(code:string) {
  const messages:Record<string,string> = {
    E_CAPACITY:"Não há vagas suficientes. Atualize a sessão e confira a ocupação.",
    E_VERSION:"Esta informação foi alterada por outro operador. Atualize a página antes de tentar novamente.",
    E_IDEMPOTENCY:"Este pedido já foi usado com outros dados. Atualize a página para fazer uma nova operação.",
    E_CANCELLED:"Esta sessão não está aberta para inscrições.", E_POLICY:"Há uma reserva com regra ainda não definida. Solicite revisão à gerência.",
    E_CONFIGURATION:"As regras desta experiência ainda não estão disponíveis.", E_FORBIDDEN:"Você não tem permissão para esta operação.",
    E_INPUT:"Confira os campos e tente novamente.",
  };
  return messages[code] ?? "Não foi possível concluir. Tente novamente; se necessário, confira se a operação foi registrada.";
}
