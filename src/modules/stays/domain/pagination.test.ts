import { expect, it } from "vitest";
import { parseStayCursor, stayPage } from "./pagination";
const rows = Array.from({ length: 51 }, (_, index) => ({ id: `80000000-0000-4000-8000-${String(index).padStart(12,"0")}`, apartment: "TEST", arrivalDate: "2026-10-09", departureDate: "2026-10-12" }));
it("pagina excedente legítimo sem declarar falha ou lista completa", () => {
  const page = stayPage(rows);
  expect(page.stays).toHaveLength(50);
  expect(parseStayCursor(page.nextCursor!)).toEqual({ date: "2026-10-09", id: rows[49].id });
  expect(stayPage(rows.slice(0,50)).nextCursor).toBeNull();
});
it("valida cursor antes de formar filtro e recusa injeção", () => {
  expect(parseStayCursor("2026-10-09_id),id.neq.null")).toBeNull();
  expect(parseStayCursor("2026-02-30_80000000-0000-4000-8000-000000000000")).toBeNull();
  expect(parseStayCursor(undefined)).toBeNull();
});
