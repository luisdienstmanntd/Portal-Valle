import { z } from "zod";

const portalEnvSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.union([z.url(), z.literal("")]).optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  })
  .superRefine((value, context) => {
    const hasUrl = Boolean(value.NEXT_PUBLIC_SUPABASE_URL);
    const hasKey = Boolean(value.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

    if (hasUrl !== hasKey) {
      context.addIssue({
        code: "custom",
        message: "Configure a URL e a chave publicável do Supabase Portal juntas.",
        path: ["NEXT_PUBLIC_SUPABASE_URL"],
      });
    }
  });

export function validatePortalEnv(env: Record<string, string | undefined> = process.env) {
  const result = portalEnvSchema.safeParse(env);

  if (!result.success) {
    throw new Error("Configuração de ambiente do Portal inválida.");
  }

  return { supabaseConfigured: Boolean(result.data.NEXT_PUBLIC_SUPABASE_URL) };
}
