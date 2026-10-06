import { expect, it } from "vitest";
import { readPortalSupabaseConfig } from "./config";

const local = { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fictitious_test", NEXT_PUBLIC_SUPABASE_PROJECT_REF: "local" };
it("ENV totalmente ausente representa preparação desconectada", () => {
  expect(readPortalSupabaseConfig({})).toBeNull();
  expect(readPortalSupabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", NEXT_PUBLIC_SUPABASE_PROJECT_REF: "" })).toBeNull();
});
it("ENV parcial falha fechada, sem refletir valores na mensagem", () => {
  const keys = Object.keys(local) as (keyof typeof local)[];
  for (let mask = 1; mask < 7; mask++) {
    const partial = Object.fromEntries(keys.filter((_, index) => mask & (1 << index)).map(key => [key, local[key]]));
    expect(() => readPortalSupabaseConfig(partial)).toThrow("Configuração de ambiente do Portal inválida.");
  }
});
it("somente configuração local completa é aceita sem fallback para chave administrativa", () => {
  expect(readPortalSupabaseConfig(local)).toMatchObject({ url: local.NEXT_PUBLIC_SUPABASE_URL, projectRef: "local" });
  for (const key of ["service_role_fictitious", "sb_secret_fictitious"]) {
    expect(() => readPortalSupabaseConfig({ ...local, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key })).toThrow("Configuração de ambiente do Portal inválida.");
  }
});
