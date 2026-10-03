import { z } from "zod";
export const loginSchema = z.object({
  email: z.email().max(254).transform(value => value.trim().toLowerCase()),
  password: z.string().min(1).max(256),
});
export type LoginState = { error: string | null };
