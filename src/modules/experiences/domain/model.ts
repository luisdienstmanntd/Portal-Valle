import { z } from "zod";

export const capacityModeSchema = z.enum(["persons", "bookings", "units", "unlimited"]);
export const bookingStatusSchema = z.enum(["reserved", "confirmed", "cancelled", "no_show"]);
export const attendanceStatusSchema = z.enum(["pending", "present", "absent"]);
const quantity = z.number().int().min(0).max(10000);
const shortText = (max: number) => z.string().trim().min(1).max(max);

export const experienceSchema = z.object({
  id: z.uuid(),
  slug: shortText(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: shortText(160), description: z.string().max(4000).nullable(),
  category: z.enum(["wine", "cinema", "gastronomy", "wellness", "leisure", "other"]),
  booking_mode: z.literal("group"), capacity_mode: capacityModeSchema,
  default_capacity: quantity.nullable(), person_limit: quantity.nullable(),
  persons_per_unit: z.number().int().min(1).max(10000).nullable(),
  active: z.boolean(), guest_bookable: z.literal(false),
}).strict().superRefine((value, ctx) => {
  if ((value.capacity_mode === "unlimited") !== (value.default_capacity === null)) {
    ctx.addIssue({ code: "custom", path: ["default_capacity"], message: "Capacidade limitada exige quantidade; ilimitada exige null." });
  }
});

export const occurrenceSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1), responsible_id: z.uuid().nullable(),
  experience_id: z.uuid(), starts_at: z.iso.datetime({ offset: true }),
  ends_at: z.iso.datetime({ offset: true }), location: shortText(160),
  capacity_override: quantity.nullable(), person_limit_override: quantity.nullable(),
  status: z.enum(["draft", "published", "cancelled", "completed"]),
  title_override: shortText(160).nullable(), description_override: z.string().max(4000).nullable(),
  metadata: z.object({ film_title: shortText(160).optional() }).strict(),
}).strict().refine(value => Date.parse(value.ends_at) > Date.parse(value.starts_at), {
  path: ["ends_at"], message: "Fim deve ser posterior ao início.",
});

export const bookingSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  occurrence_id: z.uuid(), stay_id: z.null(), apartment_number: shortText(30),
  guest_name: shortText(160), guest_phone: shortText(40).nullable(),
  adults: quantity, children: quantity, units: quantity,
  notes: z.string().max(2000).nullable(), status: bookingStatusSchema,
  attendance_status: attendanceStatusSchema, created_by: z.uuid().nullable(),
}).strict().refine(value => value.adults + value.children > 0, {
  path: ["adults"], message: "Reserva exige pelo menos uma pessoa.",
});

export type Experience = z.infer<typeof experienceSchema>;
export type Occurrence = z.infer<typeof occurrenceSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type CapacityMode = z.infer<typeof capacityModeSchema>;
