const invalidConfig = "Configuração de ambiente do Portal inválida.";
const legacyProjects = new Set(["fiamtckdglzdrynmrlpj", "fjwqnoojvtdiytedtfwt"]);

export type PortalSupabaseConfig = { url: string; publishableKey: string; projectRef: string };

export function readPortalSupabaseConfig(env: Record<string, string | undefined>): PortalSupabaseConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const projectRef = env.NEXT_PUBLIC_SUPABASE_PROJECT_REF;
  if (!url && !publishableKey && !projectRef) return null;
  if (!url || !publishableKey || !projectRef) throw new Error(invalidConfig);

  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error(invalidConfig); }
  const local = parsed.protocol === "http:" && parsed.hostname === "127.0.0.1" && projectRef === "local";
  const hosted = parsed.protocol === "https:" && /^[a-z0-9]{20}$/.test(projectRef) && !parsed.port
    && parsed.hostname === `${projectRef}.supabase.co` && !legacyProjects.has(projectRef);
  if ((!local && !hosted) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") {
    throw new Error(invalidConfig);
  }
  if (publishableKey.trim() !== publishableKey || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) throw new Error(invalidConfig);
  return { url: parsed.origin, publishableKey, projectRef };
}

export function requirePortalSupabaseConfig(): PortalSupabaseConfig {
  // Explicit references allow Next to inline only these three public variables.
  const config = readPortalSupabaseConfig({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_PROJECT_REF: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF,
  });
  if (!config) throw new Error("Supabase do Portal ainda não configurado.");
  return config;
}
