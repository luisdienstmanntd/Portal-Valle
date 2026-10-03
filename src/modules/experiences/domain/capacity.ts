import { z } from "zod";
import { bookingSchema, experienceSchema, occurrenceSchema, type Booking, type Experience, type Occurrence } from "./model";

// Operational choices have no defaults: Lora/children and no_show remain undecided.
export const capacityPolicySchema = z.object({
  countChildren: z.boolean(), noShowConsumesCapacity: z.boolean(),
}).strict();
export type CapacityPolicy = z.infer<typeof capacityPolicySchema>;

/** Pure preview calculation. It does not authorize or persist a booking. */
export function summarizeCapacity(experience: Experience, occurrence: Occurrence,
  bookings: Booking[], policy: CapacityPolicy) {
  experienceSchema.parse(experience); occurrenceSchema.parse(occurrence);
  capacityPolicySchema.parse(policy);
  if (occurrence.experience_id !== experience.id) throw new Error("Occurrence de outra experiência.");
  if (new Set(bookings.map(booking => booking.id)).size !== bookings.length) throw new Error("Reservas duplicadas na projeção.");
  const active = bookings.map(booking => bookingSchema.parse(booking)).filter(booking => {
    if (booking.occurrence_id !== occurrence.id) throw new Error("Reserva de outra occurrence.");
    return booking.status === "reserved" || booking.status === "confirmed"
      || (booking.status === "no_show" && policy.noShowConsumesCapacity);
  });
  const mode = experience.capacity_mode;
  if (mode === "unlimited" && occurrence.capacity_override !== null) {
    throw new Error("Experiência ilimitada não admite capacity_override.");
  }
  const capacity = occurrence.capacity_override ?? experience.default_capacity;
  const personLimit = occurrence.person_limit_override ?? experience.person_limit;
  const persons = active.reduce((sum, booking) => sum + booking.adults + booking.children, 0);
  const used = mode === "unlimited" ? null : active.reduce((sum, booking) => {
    if (mode === "units" && booking.units < 1) throw new Error("Reserva por unidade exige unidade positiva.");
    return sum + (mode === "persons" ? booking.adults + (policy.countChildren ? booking.children : 0)
      : mode === "bookings" ? 1 : booking.units);
  }, 0);
  return { mode, capacity, used, remaining: used === null ? null : Math.max(0, capacity! - used),
    persons, personLimit, overCapacity: (used !== null && used > capacity!)
      || (personLimit !== null && persons > personLimit) };
}
