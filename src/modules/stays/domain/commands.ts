import { z } from "zod";
import { staySchema } from "./model";
export const createStayCommandSchema = staySchema;
export const linkBookingStayCommandSchema = z.strictObject({
  bookingId: z.uuid(), version: z.number().int().min(0).max(1_000_000), stayId: z.uuid().nullable(),
});
export function linkOperationError(code: string): string {
  if (code.includes("E_FORBIDDEN")) return "Seu acesso não permite vincular reservas a estadias.";
  if (code.includes("E_PERIOD")) return "O apartamento ou a data da atividade não corresponde a esta estadia.";
  if (code.includes("E_CANCELLED")) return "Reservas canceladas não podem ser vinculadas.";
  if (code.includes("E_VERSION") || code.includes("E_IDEMPOTENCY")) return "A reserva mudou ou já foi vinculada. Atualize a página.";
  if (code.includes("E_INPUT")) return "Não foi possível identificar a reserva ou a estadia.";
  return "Não foi possível alterar o vínculo. Tente novamente.";
}
export function stayOperationError(code: string): string {
  if (code.includes("E_INPUT")) return "Confira o apartamento e as datas de entrada e saída.";
  if (code.includes("E_FORBIDDEN")) return "Seu acesso não permite cadastrar estadias.";
  if (code.includes("E_VERSION") || code.includes("E_IDEMPOTENCY")) return "Este cadastro já foi enviado. Atualize a página antes de tentar novamente.";
  return "Não foi possível cadastrar a estadia. Tente novamente com os mesmos dados.";
}
