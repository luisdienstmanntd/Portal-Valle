import { expect, test } from "@playwright/test";
test("Hoje reúne quatro áreas desconhecidas sem ausência fictícia", async ({ page }) => {
  await page.goto("/hoje");
  for (const id of ["portal", "pool", "gym", "osteria"]) {
    const card = page.getByTestId(`home-source-${id}`);
    await expect(card.getByText("Conexão pendente", { exact: true })).toBeVisible();
    await expect(card.getByRole("link")).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Agenda aguardando consulta", exact: true })).toBeVisible();
  await expect(page.getByText("Nenhuma atividade encontrada neste dia", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("hoje.png"), fullPage: true });
  await page.getByTestId("home-source-osteria").getByRole("link").click();
  await expect(page.getByRole("heading", { level: 1, name: "Osteria", exact: true })).toBeVisible();
});
