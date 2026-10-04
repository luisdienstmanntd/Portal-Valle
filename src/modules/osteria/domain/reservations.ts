import { z } from "zod";
import { localDateSchema } from "../../../lib/hotel-date";
import { hotelDateTimeToInstant } from "../../../lib/hotel-time";

const customerType = z.enum(["hospede", "externo", "passante", "roomservice"]);
const rowSchema = z.object({
  id: z.uuid().transform(value => value.toLowerCase()), data: localDateSchema,
  horario: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/),
  hospede_id: z.uuid().nullable(), hospedes: z.object({ tipo: customerType }).strict().nullable(),
  paxs: z.number().int().min(0).max(1000), chd: z.number().int().min(0).max(1000),
  mesa_identificador: z.string().trim().min(1).max(80).nullable(),
  bloqueado: z.boolean(), somente_hospedes: z.boolean(), cancelado_em: z.iso.datetime({ offset: true }).nullable(),
}).strict();
export type OsteriaReservation = {
  id: string; start: string; adults: number; children: number; people: number;
  table: string | null; customerType: z.infer<typeof customerType>; status: "scheduled" | "cancelled";
};
export function mapOsteriaReservations(raw: unknown, date: string): OsteriaReservation[] {
  localDateSchema.parse(date);
  const rows = z.array(rowSchema).max(500).parse(raw), ids = new Set<string>();
  const result: OsteriaReservation[] = [];
  for (const row of rows) {
    if (row.data !== date || ids.has(row.id)) throw new Error("Contrato Osteria inválido.");
    ids.add(row.id);
    if (row.bloqueado || row.somente_hospedes || row.hospede_id === null) continue;
    if (!row.hospedes || row.paxs < 1) throw new Error("Reserva Osteria incompleta.");
    const start = hotelDateTimeToInstant(`${date}T${row.horario}`);
    result.push({ id: `osteria:${row.id}`, start, adults: row.paxs, children: row.chd, people: row.paxs + row.chd,
      table: row.mesa_identificador, customerType: row.hospedes.tipo, status: row.cancelado_em ? "cancelled" : "scheduled" });
  }
  return result.sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
