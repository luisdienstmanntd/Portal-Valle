import { test, expect } from "@playwright/test";
test("estadia sem conexão informa limites e valida período sem inventar inscrições", async ({ page }) => {
  await page.goto("/estadias");
  await expect(page.getByRole("heading", { name: "Visão Estadia", exact: true })).toBeVisible();
  const form = page.getByRole("form", { name: "Consultar estadia" });
  await form.getByLabel("Apartamento", { exact: true }).fill("403");
  await form.getByLabel("Início do período", { exact: true }).fill("2026-10-08");
  await form.getByLabel("Fim do período · inclusive", { exact: true }).fill("2026-10-10");
  await form.getByRole("button", { name: "Consultar inscrições" }).click();
  await expect(page.getByRole("heading", { name: "APTO 403", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Conexão pendente");
  await expect(page.getByText(/Nenhuma inscrição encontrada/)).toHaveCount(0);
  await expect(page.getByText(/um apartamento pode receber pessoas diferentes/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("stay-preview.png"), fullPage: true });
  await page.goto("/estadias?apto=403&inicio=2026-10-10&fim=2026-10-08");
  await expect(page.getByRole("alert").filter({ hasText: "Informe um apartamento válido" })).toContainText("período de até 31 dias");
  await expect(page.getByRole("region", { name: "Inscrições do apartamento" })).toHaveCount(0);
});
