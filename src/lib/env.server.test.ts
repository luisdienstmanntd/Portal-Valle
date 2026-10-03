import { describe, expect, it } from "vitest";
import { validatePortalEnv } from "./env.server";

describe("validatePortalEnv", () => {
  it("permite executar a fundação sem projeto Supabase", () => {
    expect(validatePortalEnv({})).toEqual({ supabaseConfigured: false });
  });

  it("aceita URL e chave publicável do mesmo ambiente fornecidas juntas", () => {
    expect(
      validatePortalEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
        NEXT_PUBLIC_SUPABASE_PROJECT_REF: "abcdefghijklmnopqrst",
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

describe("isolamento e segredos da configuração Supabase", () => {
  const valid = {
    NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    NEXT_PUBLIC_SUPABASE_PROJECT_REF: "abcdefghijklmnopqrst",
  };

  it.each(["fiamtckdglzdrynmrlpj", "fjwqnoojvtdiytedtfwt"])("bloqueia o projeto legado %s", (ref) => {
    expect(() => validatePortalEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`, NEXT_PUBLIC_SUPABASE_PROJECT_REF: ref }))
      .toThrow("Configuração de ambiente do Portal inválida.");
  });

  it.each(["sb_secret_sensitive", "eyJservice-role-secret", " ", "sb_publishable_value\n"])("rejeita chave não publicável sem revelar valores (%#)", (key) => {
    expect(() => validatePortalEnv({ ...valid, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }))
      .toThrowError(/^Configuração de ambiente do Portal inválida\.$/);
  });

  it.each([
    "http://abcdefghijklmnopqrst.supabase.co",
    "https://another-project.supabase.co",
    "https://abcdefghijklmnopqrst.supabase.co/path",
    "https://abcdefghijklmnopqrst.supabase.co?token=secret",
    "https://user:secret@abcdefghijklmnopqrst.supabase.co",
  ])("rejeita transporte ou identidade incorretos (%#)", (url) => {
    expect(() => validatePortalEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: url }))
      .toThrowError(/^Configuração de ambiente do Portal inválida\.$/);
  });

  it("permite apenas o loopback explícito para Supabase local", () => {
    expect(validatePortalEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321", NEXT_PUBLIC_SUPABASE_PROJECT_REF: "local" }))
      .toEqual({ supabaseConfigured: true });
    expect(() => validatePortalEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "http://192.168.1.1:54321", NEXT_PUBLIC_SUPABASE_PROJECT_REF: "local" }))
      .toThrow();
  });

  it("aceita referência própria alfanumérica", () => {
    const ref = "abcd1234efgh5678ijkl";
    expect(validatePortalEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`, NEXT_PUBLIC_SUPABASE_PROJECT_REF: ref }))
      .toEqual({ supabaseConfigured: true });
  });
});
