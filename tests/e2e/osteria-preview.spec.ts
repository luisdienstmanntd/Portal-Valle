import { expect, test } from "@playwright/test";
test("Osteria desconectada navega datas e preserva operação na origem", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (!request.url().startsWith("http://127.0.0.1:")) external.push(request.url()); });
  await page.goto("/osteria?dia=2026-12-31");
  await expect(page.getByRole("heading", { name: "Reservas do dia · 31/12/2026", exact: true })).toBeVisible();
  await expect(page.getByText("Conexão pendente", { exact: true })).toBeVisible();
  await expect(page.getByText(/0 reservas ativas/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Abrir Gestão da Osteria ↗", exact: true })).toHaveAttribute("href", "https://osteriadilucca.web.app/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("osteria.png"), fullPage: true });
  await page.getByRole("link", { name: "Próximo dia →", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Reservas do dia · 01/01/2027", exact: true })).toBeVisible();
  await page.goto("/osteria?dia=2099-12-31"); await expect(page.getByRole("link", { name: "Próximo dia →", exact: true })).toHaveCount(0);
  await page.goto("/osteria?dia=2026-02-30"); await expect(page.getByRole("status")).toContainText("Data inválida");
  expect(external).toEqual([]);
});
