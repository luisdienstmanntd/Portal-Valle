import { describe, expect, it } from "vitest";
import { createStayCommandSchema, linkBookingStayCommandSchema, linkOperationError, stayOperationError } from "./commands";
const valid = { id: "80000000-0000-4000-8000-000000000001", apartment: " 101-A ", arrivalDate: "2026-10-09", departureDate: "2026-10-12" };
describe("cadastro próprio de estadia", () => {
  it("normaliza apartamento e permite o dia de saída sem presumir horário", () => {
    expect(createStayCommandSchema.parse(valid).apartment).toBe("101-A");
    expect(createStayCommandSchema.safeParse({ ...valid, departureDate: valid.arrivalDate }).success).toBe(true);
  });
  it("recusa período invertido, data impossível e conteúdo que não identifica apartamento", () => {
    for (const override of [{ departureDate: "2026-10-08" }, { arrivalDate: "2026-02-30" }, { apartment: "<script>" }, { apartment: "" }, { role: "admin" }]) {
      expect(createStayCommandSchema.safeParse({ ...valid, ...override }).success).toBe(false);
    }
  });
  it("não expõe erros SQL ou dados recebidos", () => {
    expect(stayOperationError("database error secret@example.test")).not.toContain("secret");
    expect(stayOperationError("E_IDEMPOTENCY")).toContain("já foi enviado");
  });
  it("valida vínculo explícito e permite desvincular com stayId nulo", () => {
    const link = { bookingId: valid.id, version: 1, stayId: "80000000-0000-4000-8000-000000000002" };
    expect(linkBookingStayCommandSchema.safeParse(link).success).toBe(true);
    expect(linkBookingStayCommandSchema.safeParse({ ...link, stayId: null }).success).toBe(true);
    for (const override of [{ stayId: "101" }, { version: -1 }, { version: 1.5 }, { role: "admin" }]) {
      expect(linkBookingStayCommandSchema.safeParse({ ...link, ...override }).success).toBe(false);
    }
  });
  it("traduz erros de vínculo sem expor SQL", () => {
    expect(linkOperationError("E_PERIOD")).toContain("não corresponde");
    expect(linkOperationError("secret@example.test")).not.toContain("secret");
  });
});
