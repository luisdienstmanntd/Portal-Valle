import { z } from "zod";
import { stayEntrySchema, stayRange, stayScopeSchema, type StayScope, type StayView } from "../domain/stay";

export type StayReader = (scope: StayScope, signal: AbortSignal) => Promise<unknown>;
export async function readStay(input: unknown, reader: StayReader | null, timeoutMs = 5000): Promise<StayView> {
  const scope = stayScopeSchema.parse(input), range = stayRange(scope);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new Error("Prazo inválido.");
  if (!reader) return { scope, status: "unknown", entries: [] };
  const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { reject(new Error("TIMEOUT")); controller.abort(); }, timeoutMs); });
    const entries = z.array(stayEntrySchema).max(100).parse(await Promise.race([
      Promise.resolve().then(() => reader(scope, controller.signal)), deadline,
    ]));
    if (new Set(entries.map(e => e.id)).size !== entries.length || entries.some(e => e.apartment !== scope.apartment ||
      Date.parse(e.start) < Date.parse(range.from) || Date.parse(e.start) >= Date.parse(range.until))) throw new Error("INVALID_PAYLOAD");
    entries.sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || a.id.localeCompare(b.id));
    return { scope, status: entries.length ? "available" : "empty", entries };
  } catch { return { scope, status: "unavailable", entries: [] }; }
  finally { if (timer !== undefined) clearTimeout(timer); }
}
