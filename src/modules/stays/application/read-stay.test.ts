import { describe, it, expect, vi } from "vitest";
import { stayRange, stayScopeSchema } from "../domain/stay";
import { readStay } from "./read-stay";

const scope = { apartment: "403", arrival: "2026-10-08", departure: "2026-10-10" };
const entry = { id: "11111111-1111-4111-8111-111111111111", sessionId: "22222222-2222-4222-8222-222222222222",
  apartment: "403", slug: "cine-toscana", title: "Cine Toscana", start: "2026-10-09T01:00:00Z", end: "2026-10-09T03:00:00Z",
  bookingStatus: "cancelled", sessionStatus: "published" };
describe("consulta de estadia", () => {
  it("valida período, apartamento e limites civis inclusivos no fuso do hotel", () => {
    expect(stayRange(scope)).toEqual({ from: "2026-10-08T03:00:00.000Z", until: "2026-10-11T03:00:00.000Z" });
    for (const change of [{ apartment: "" }, { arrival: "2026-02-30" }, { departure: "2026-10-07" }, { departure: "2026-11-08" }, { apartment: ["403"] }]) {
      expect(stayScopeSchema.safeParse({ ...scope, ...change }).success).toBe(false);
    }
    expect(stayScopeSchema.parse({ ...scope, apartment: " 403 " }).apartment).toBe("403");
    expect(stayScopeSchema.parse({ ...scope, apartment: "Suíte (1)/A" }).apartment).toBe("Suíte (1)/A");
  });
  it("diferencia desconectado, consulta vazia e falha", async () => {
    expect((await readStay(scope, null)).status).toBe("unknown");
    expect((await readStay(scope, async () => [])).status).toBe("empty");
    expect((await readStay({ ...scope, apartment: "403/A" }, async () => [{ ...entry, apartment: "403/A" }])).status).toBe("available");
    expect(await readStay(scope, async () => { throw new Error("PRIVATE"); })).toMatchObject({ status: "unavailable", entries: [] });
  });
  it("preserva cancelamentos e ordena inscrições distintas da mesma sessão", async () => {
    const second = { ...entry, id: "33333333-3333-4333-8333-333333333333", start: "2026-10-10T23:00:00Z", end: "2026-10-11T01:00:00Z", bookingStatus: "confirmed" };
    const result = await readStay(scope, async () => [second, entry]);
    expect(result.status).toBe("available"); expect(result.entries).toEqual([entry, second]);
  });
  it("rejeita integralmente outro apartamento, fora do período, IDs repetidos e PII extra", async () => {
    for (const rows of [[{ ...entry, apartment: "404" }], [{ ...entry, start: "2026-10-11T03:00:00Z", end: "2026-10-11T04:00:00Z" }],
      [entry, entry], [{ ...entry, guest_name: "PRIVATE" }], Array.from({ length: 101 }, () => entry)]) {
      expect(await readStay(scope, async () => rows)).toMatchObject({ status: "unavailable", entries: [] });
    }
  });
  it("aborta leitor que não responde e libera timer", async () => {
    vi.useFakeTimers(); let signal: AbortSignal | undefined;
    try {
      const result = readStay(scope, async (_, supplied) => { signal = supplied; return new Promise(() => {}); }, 50);
      await vi.advanceTimersByTimeAsync(50);
      expect(await result).toMatchObject({ status: "unavailable", entries: [] });
      expect(signal?.aborted).toBe(true); expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
