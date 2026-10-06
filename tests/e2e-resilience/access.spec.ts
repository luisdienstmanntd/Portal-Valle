import { test, expect, type BrowserContext, type APIRequestContext, type Page } from "@playwright/test";
import { stringToBase64URL } from "@supabase/ssr";
// @ts-expect-error Synthetic fixture is a checked-in Node-only test module.
import { syntheticSession } from "../fixtures/portal-service.mjs";

const control = async (request: APIRequestContext, mode: string) => { expect((await request.post("http://127.0.0.1:3154/__scenario", { data: { mode } })).ok()).toBe(true); };
const signIn = async (context: BrowserContext, expired = false) => context.addCookies([{ name: "sb-127-auth-token", value: "base64-" + stringToBase64URL(JSON.stringify(syntheticSession(expired))), domain: "127.0.0.1", path: "/", httpOnly: false, sameSite: "Lax" }]);
async function unavailable(page: Page) {
  await expect(page).toHaveURL(/\/indisponivel$/);
  await expect(page.getByRole("heading", { name: "Acesso temporariamente indisponível", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resumo do dia", exact: true })).toHaveCount(0);
  expect(await page.content()).not.toMatch(/PRIVATE-|SQL-MARKER|TOKEN-MARKER/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
test.beforeEach(async ({ request }) => control(request, "normal"));

for (const mode of ["portal-offline", "portal-timeout"]) test(`${mode}: página operacional tem erro sanitizado e recupera`, async ({ page, context, request }) => {
  await signIn(context); await control(request, mode); const started = Date.now();
  await page.goto("/experiencias/cine-toscana");
  await expect(page.getByRole("heading", { name: "Não foi possível carregar esta área", exact: true })).toBeVisible();
  expect(Date.now() - started).toBeLessThan(12000);
  expect(await page.content()).not.toContain("PRIVATE-DATA-MARKER");
  await control(request, "normal"); await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cine Toscana", exact: true })).toBeVisible();
});

for (const mode of ["auth-offline", "profile-offline", "profile-schema"]) test(`${mode}: acesso protegido falha fechado e recupera`, async ({ page, context, request }) => {
  await signIn(context); await control(request, mode);
  const response = await page.goto("/hoje"); await unavailable(page);
  expect(response?.headers()["cache-control"]).toContain("no-store");
  await page.goto("/experiencias"); await unavailable(page);
  await control(request, "normal"); await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Hoje", exact: true })).toBeVisible();
});
for (const mode of ["auth-timeout", "profile-timeout"]) test(`${mode}: prazo finito sem liberar dados`, async ({ page, context, request }) => {
  await signIn(context); await control(request, mode); const started = Date.now();
  await page.goto("/hoje"); await unavailable(page); expect(Date.now() - started).toBeLessThan(12000);
});
test("refresh expirado offline não trava nem entra em loop", async ({ page, context, request }) => {
  await signIn(context, true); await control(request, "auth-offline");
  await page.goto("/hoje"); await unavailable(page);
  const stats = await (await request.get("http://127.0.0.1:3154/__scenario")).json();
  expect(stats.counts["/auth/v1/token"]).toBeGreaterThan(0);
});
test("dados Portal offline depois de autorização mostram Home parcial sem falso zero", async ({ page, context, request }) => {
  await signIn(context); await control(request, "portal-offline"); await page.goto("/hoje");
  await expect(page.getByRole("heading", { name: "Hoje", exact: true })).toBeVisible();
  await expect(page.getByText("Consulta indisponível", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Visão parcial do dia");
  await expect(page.getByText("0 sessões no dia, incluindo canceladas e concluídas.", { exact: true })).toHaveCount(0);
  expect(await page.content()).not.toContain("PRIVATE-DATA-MARKER");
  await control(request, "normal"); await page.getByRole("button", { name: "Atualizar dia", exact: true }).click();
  await expect(page.getByText("Consultado · sem atividades", { exact: true })).toBeVisible();
});
test("ENV ausente mantém somente preparação, ENV parcial/legado não abre conteúdo", async ({ page }) => {
  await page.goto("http://127.0.0.1:3115/hoje"); await expect(page.getByText("Conexão pendente", { exact: true })).toHaveCount(4);
  await page.goto("http://127.0.0.1:3115/login"); await expect(page.getByLabel("E-mail", { exact: true })).toBeDisabled();
  for (const port of [3116, 3117]) {
    await page.goto(`http://127.0.0.1:${port}/hoje`); await unavailable(page);
    await page.getByRole("button", { name: "Tentar novamente", exact: true }).click(); await unavailable(page);
    await page.goto(`http://127.0.0.1:${port}/login`); await unavailable(page);
  }
});
test("login com serviço offline devolve mensagem sanitizada sem afirmar acesso", async ({ page, request }) => {
  await page.goto("/login"); await control(request, "token-offline");
  await page.getByLabel("E-mail", { exact: true }).fill("synthetic@portal.test");
  await page.getByLabel("Senha", { exact: true }).fill("synthetic-test-only");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("alert", { name: "Erro ao entrar" })).toContainText("temporariamente indisponível", { timeout: 12000 });
  await expect(page).toHaveURL(/\/login$/); expect(await page.content()).not.toContain("PRIVATE-TOKEN-MARKER");
});
