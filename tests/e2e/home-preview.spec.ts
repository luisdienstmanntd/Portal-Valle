import { expect, test } from "@playwright/test";
test("Hoje reúne quatro áreas desconhecidas sem ausência fictícia", async ({ page }) => {
  await page.goto("/hoje");
  const program = page.getByTestId("hotel-program");
  await expect(program.getByRole("heading", { name: "Bem-estar no Valle" })).toBeVisible();
  await expect(program.getByText("09/10/2026 a 12/10/2026", { exact: true })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("program-top.png") });
  expect(await page.locator("#main-content").locator('[data-testid="hotel-program"], [data-testid="home-source-portal"]').evaluateAll(nodes => nodes[0].getAttribute("data-testid"))).toBe("hotel-program");
  await expect(program.getByText("Alchemy Bar Workshop", { exact: false })).toBeVisible();
  await program.locator("details").nth(1).locator("summary").click();
  await expect(program.getByText("Aquaflow", { exact: false })).toBeVisible();
  await program.locator("details").nth(3).locator("summary").click();
  await expect(program.getByText("Brunch do Valle", { exact: true })).toBeVisible();
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
