import { describe, expect, it } from "vitest";
import { bookingSchema, experienceSchema, occurrenceSchema, type Booking, type Experience, type Occurrence } from "./model";
import { summarizeCapacity } from "./capacity";
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const experience = (patch: Partial<Experience> = {}): Experience => ({ id: id(1), slug: "test-experience",
  name: "Experiência fictícia", description: null, category: "other", booking_mode: "group",
  capacity_mode: "persons", default_capacity: 8, person_limit: null, persons_per_unit: null, children_allowed: null, active: false,
  guest_bookable: false, ...patch });
const occurrence = (patch: Partial<Occurrence> = {}): Occurrence => ({ id: id(2), experience_id: id(1), version: 1, responsible_id: null,
  starts_at: "2026-10-08T18:00:00-03:00", ends_at: "2026-10-08T19:00:00-03:00", location: "Local fictício",
  capacity_override: null, person_limit_override: null, status: "draft", title_override: null,
  description_override: null, metadata: {}, ...patch });
const booking = (patch: Partial<Booking> = {}): Booking => ({ id: id(3), occurrence_id: id(2), stay_id: null, version: 1,
  apartment_number: "TEST", guest_name: "Pessoa fictícia", guest_phone: null, adults: 2, children: 1,
  units: 1, notes: null, status: "reserved", attendance_status: "pending", created_by: id(4), ...patch });
const policy = { countChildren: true, noShowConsumesCapacity: true };

describe("capacidade com unidade e decisões explícitas", () => {
  it.each([["persons", 3], ["bookings", 1], ["units", 2]] as const)("%s usa sua própria unidade", (mode, used) => {
    expect(summarizeCapacity(experience({ capacity_mode: mode }), occurrence(), [booking({ units: 2 })], policy).used).toBe(used);
  });
  it("crianças não recebem uma regra implícita", () => {
    expect(summarizeCapacity(experience(), occurrence(), [booking()], { ...policy, countChildren: false }).used).toBe(2);
    expect(() => summarizeCapacity(experience(), occurrence(), [], undefined as never)).toThrow();
  });
  it("cancelada não ocupa, presença não cancela a reserva", () => {
    const result = summarizeCapacity(experience(), occurrence(), [booking({ status: "cancelled" }),
      booking({ id: id(5), status: "confirmed", attendance_status: "absent" })], policy);
    expect(result.used).toBe(3);
  });
  it.each([true, false])("no_show com política %s", noShowConsumesCapacity => {
    expect(summarizeCapacity(experience(), occurrence(), [booking({ status: "no_show" })],
      { ...policy, noShowConsumesCapacity }).used).toBe(noShowConsumesCapacity ? 3 : 0);
  });
  it("override zero fecha vagas, sem fallback ao default", () => {
    expect(summarizeCapacity(experience(), occurrence({ capacity_override: 0 }), [booking()], policy))
      .toMatchObject({ capacity: 0, remaining: 0, overCapacity: true });
  });
  it("ilimitado não inventa denominador nem ocupação zero", () => {
    expect(summarizeCapacity(experience({ capacity_mode: "unlimited", default_capacity: null }), occurrence(), [booking()], policy))
      .toMatchObject({ capacity: null, used: null, remaining: null, persons: 3, overCapacity: false });
    expect(() => summarizeCapacity(experience({ capacity_mode: "unlimited", default_capacity: null }),
      occurrence({ capacity_override: 4 }), [], policy)).toThrow();
  });
  it("Cine: 4 puffs e 8 pessoas são limites independentes", () => {
    const cine = experience({ capacity_mode: "units", default_capacity: 4, person_limit: 8 });
    expect(summarizeCapacity(cine, occurrence(), [booking({ adults: 8, children: 0, units: 4 })], policy).overCapacity).toBe(false);
    expect(summarizeCapacity(cine, occurrence(), [booking({ adults: 9, children: 0, units: 4 })], policy).overCapacity).toBe(true);
    expect(summarizeCapacity(cine, occurrence(), [booking({ adults: 2, children: 0, units: 5 })], policy).overCapacity).toBe(true);
  });
  it("limite físico conta todas as pessoas independentemente da política principal", () => {
    expect(summarizeCapacity(experience({ person_limit: 2 }), occurrence(), [booking()],
      { ...policy, countChildren: false }).overCapacity).toBe(true);
  });
  it("unidades exigem quantidade positiva", () => {
    expect(() => summarizeCapacity(experience({ capacity_mode: "units" }), occurrence(), [booking({ units: 0 })], policy)).toThrow();
  });
  it("não agrega reservas ou occurrences de outra experiência", () => {
    expect(() => summarizeCapacity(experience(), occurrence({ experience_id: id(9) }), [], policy)).toThrow();
    expect(() => summarizeCapacity(experience(), occurrence(), [booking({ occurrence_id: id(9) })], policy)).toThrow();
    expect(() => summarizeCapacity(experience(), occurrence(), [booking(), booking()], policy)).toThrow();
  });
});

describe("validação sem framework ou banco", () => {
  it("aceita os três modelos completos e mantém status/presença independentes", () => {
    expect(experienceSchema.safeParse(experience()).success).toBe(true);
    expect(occurrenceSchema.safeParse(occurrence()).success).toBe(true);
    expect(bookingSchema.safeParse(booking({ status: "no_show", attendance_status: "present" })).success).toBe(true);
  });
  it.each([-1, 1.5, NaN, Infinity, 10001])("quantidade inválida %s recusada", adults => {
    expect(bookingSchema.safeParse(booking({ adults })).success).toBe(false);
  });
  it("recusa grupo vazio, PII excessiva, stay futuro e campos extras", () => {
    for (const value of [booking({ adults: 0, children: 0 }), booking({ guest_name: " " }),
      booking({ notes: "x".repeat(2001) }), { ...booking(), stay_id: id(9) }, { ...booking(), role: "admin" }]) {
      expect(bookingSchema.safeParse(value).success).toBe(false);
    }
  });
  it("exige instante com fuso e fim posterior, comparando instantes", () => {
    for (const value of [occurrence({ starts_at: "2026-10-08T18:00:00" }), occurrence({ ends_at: "2026-10-08T20:00:00Z" })]) {
      expect(occurrenceSchema.safeParse(value).success).toBe(false);
    }
    expect(occurrenceSchema.safeParse(occurrence({ ends_at: "2026-10-08T23:00:00Z" })).success).toBe(true);
  });
  it("metadata tem contrato restrito, não um saco de dados pessoais", () => {
    expect(occurrenceSchema.safeParse(occurrence({ metadata: { film_title: "Filme fictício" } })).success).toBe(true);
    expect(occurrenceSchema.safeParse({ ...occurrence(), metadata: { guest_phone: "test" } }).success).toBe(false);
  });
  it("capacidade e modo coerentes; slug e cadastro público restritos", () => {
    for (const value of [experience({ default_capacity: null }), experience({ capacity_mode: "unlimited" }),
      experience({ slug: "Invalid Slug" }), { ...experience(), guest_bookable: true }]) {
      expect(experienceSchema.safeParse(value).success).toBe(false);
    }
  });
});
