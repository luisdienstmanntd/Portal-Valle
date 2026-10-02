import { describe, expect, it } from "vitest";
import { validatePortalEnv } from "./env.server";

describe("validatePortalEnv", () => {
  it("permite executar a fundação sem projeto Supabase", () => {
    expect(validatePortalEnv({})).toEqual({ supabaseConfigured: false });
  });

  it("aceita URL e chave publicável do mesmo ambiente fornecidas juntas", () => {
    expect(
      validatePortalEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://portal.example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({ supabaseConfigured: true });
  });

  it("rejeita configuração parcial ou URL inválida sem revelar valores", () => {
    expect(() => validatePortalEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://portal.example.supabase.co" })).toThrow(
      "Configuração de ambiente do Portal inválida.",
    );
    expect(() =>
      validatePortalEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toThrow("Configuração de ambiente do Portal inválida.");
  });
});
