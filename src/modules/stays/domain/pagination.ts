import { z } from "zod";
import { localDateSchema } from "../../../lib/hotel-date";
import { staySchema, type Stay } from "./model";
export const stayPageSize = 50;
export function parseStayCursor(value: string | undefined) {
  if (!value) return null;
  const [date, id, extra] = value.split("_");
  if (extra !== undefined) return null;
  const result = z.object({ date: localDateSchema, id: z.uuid() }).safeParse({ date, id });
  return result.success ? result.data : null;
}
export function stayPage(raw: Stay[]) {
  if (raw.length > stayPageSize + 1) throw new Error("Página de estadias inválida.");
  const validated = raw.map(row => staySchema.parse(row));
  const stays = validated.slice(0, stayPageSize);
  const last = stays.at(-1);
  return { stays, nextCursor: validated.length > stayPageSize && last ? `${last.arrivalDate}_${last.id}` : null };
}
