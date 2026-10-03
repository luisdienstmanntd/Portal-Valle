import { expect, it } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { summarizeCapacity } from "../domain/capacity";
import { toBooking, toExperience, toOccurrence } from "./mapping";
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const timestamps = { created_at: "2026-10-03T12:00:00+00:00", updated_at: "2026-10-03T12:01:00+00:00" };
type Rows = Database["public"]["Tables"];
const experience: Rows["experiences"]["Row"] = { id: id(1), slug: "test-cine", name: "Cinema fictício",
  description: null, category: "cinema", booking_mode: "group", capacity_mode: "units",
  default_capacity: 4, person_limit: 8, persons_per_unit: 2, children_allowed: false, active: false, guest_bookable: false, ...timestamps };
const occurrence: Rows["experience_occurrences"]["Row"] = { id: id(2), experience_id: id(1), version: 1, responsible_id: null,
  starts_at: "2026-10-08T22:30:00+00:00", ends_at: "2026-10-09T00:30:00+00:00", location: "Local fictício",
  capacity_override: null, person_limit_override: null, status: "draft", title_override: null,
  description_override: null, metadata: {}, ...timestamps };
const booking: Rows["experience_bookings"]["Row"] = { id: id(3), occurrence_id: id(2), stay_id: null, version: 1,
  apartment_number: "TEST", guest_name: "Pessoa fictícia", guest_phone: null, adults: 2, children: 0,
  units: 1, notes: null, status: "reserved", attendance_status: "pending", created_by: id(4), ...timestamps };

it("linhas completas do banco passam por conversão antes da projeção", () => {
  const result = summarizeCapacity(toExperience(experience), toOccurrence(occurrence), [toBooking(booking)],
    { countChildren: true, noShowConsumesCapacity: true });
  expect(result).toMatchObject({ used: 1, persons: 2, remaining: 3, overCapacity: false });
  expect(toExperience(experience)).not.toHaveProperty("created_at");
});
it("conversão recusa timestamps inválidos e dados inesperados", () => {
  expect(() => toExperience({ ...experience, created_at: "invalid" })).toThrow();
  expect(() => toOccurrence({ ...occurrence, metadata: { extra: "test" } } as never)).toThrow();
});
it("histórico continua legível após remoção do operador", () => {
  expect(toBooking({ ...booking, created_by: null }).created_by).toBeNull();
});
