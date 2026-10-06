import { expect, test } from "@playwright/test";
test("estadia prepara cadastro próprio sem dados ou vínculos fictícios", async ({ page }) => {
  await page.goto("/estadias");
  await expect(page.getByRole("heading", { name: "Estadias", exact: true })).toBeVisible();
  for (const label of ["Apartamento", "Entrada", "Saída"]) await expect(page.getByLabel(label, { exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cadastrar estadia" })).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Aguardando cadastro e vínculo" })).toBeVisible();
  await expect(page.getByText("Nenhuma atividade encontrada", { exact: false })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("estadias.png"), fullPage: true });
});
