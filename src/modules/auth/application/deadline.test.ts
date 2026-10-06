import { afterEach, expect, it, vi } from "vitest";
import { AccessUnavailable, withAccessDeadline } from "./deadline";
afterEach(() => vi.useRealTimers());

it("deadline limita transporte não cooperativo, aborta e remove timer", async () => {
  vi.useFakeTimers(); let signal: AbortSignal | undefined;
  const result = withAccessDeadline(async s => { signal = s; return new Promise(() => {}); }, 10);
  const assertion = expect(result).rejects.toBeInstanceOf(AccessUnavailable);
  await vi.advanceTimersByTimeAsync(11); await assertion;
  expect(signal?.aborted).toBe(true); expect(vi.getTimerCount()).toBe(0);
});
it("sucesso e rejeição imediata limpam timers; exceções do framework ficam para o chamador", async () => {
  vi.useFakeTimers();
  expect(await withAccessDeadline(async () => "ok")).toBe("ok");
  const failure = new Error("synthetic failure");
  await expect(withAccessDeadline(async () => { throw failure; })).rejects.toBe(failure);
  expect(vi.getTimerCount()).toBe(0);
});
