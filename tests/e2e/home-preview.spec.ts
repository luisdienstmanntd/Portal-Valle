import { test, expect } from "@playwright/test";

test("Hoje reúne quatro fontes sem afirmar zero quando desconectadas", async ({ page }) => {
  await page.goto("/hoje");
  const sources = page.getByRole("region", { name: "Resumo do dia" });
  await expect(sources.getByText("Conexão pendente", { exact: true })).toHaveCount(4);
  for (const name of ["Experiências Portal", "Piscina", "Academia", "Osteria"]) await expect(sources.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Visão parcial do dia");
  await expect(page.getByRole("heading", { name: "Agenda aguardando consulta", exact: true })).toBeVisible();
  await expect(page.getByText(/0 horários reservados|0 reservas ativas|0 sessões no dia/)).toHaveCount(0);
  await page.getByRole("button", { name: "Atualizar dia", exact: true }).click();
  await expect(sources.getByText("Conexão pendente", { exact: true })).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("home-preview.png"), fullPage: true });
  await sources.getByRole("link", { name: "Ver osteria →", exact: true }).click();
  await expect(page).toHaveURL(/\/osteria\?dia=\d{4}-\d{2}-\d{2}$/);
  await expect(page.getByRole("link", { name: "Abrir Gestão da Osteria ↗", exact: true })).toBeVisible();
});
