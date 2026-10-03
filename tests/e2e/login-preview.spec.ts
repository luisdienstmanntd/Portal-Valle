import { test, expect } from "@playwright/test";
test("login de preparação é acessível e preserva a prévia sem contas fictícias", async ({ page }, testInfo) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Bem-vindo ao Valle." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeDisabled();
  await expect(page.getByLabel("E-mail", { exact: true })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("login.png"), fullPage: true });
  await page.getByRole("link", { name: "Conhecer o Portal" }).click();
  await expect(page).toHaveURL(/\/hoje$/);
});
