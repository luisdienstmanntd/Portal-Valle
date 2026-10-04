import { test, expect } from "@playwright/test";
test("Facilities desconectado preserva desconhecido e sistema original", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (!request.url().startsWith("http://127.0.0.1:")) external.push(request.url()); });
  for (const path of ["/piscina", "/academia"]) {
    await page.goto(path + "?dia=2026-12-31");
    await expect(page.getByText("Conexão pendente", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reservas do dia · 31/12/2026", exact: true })).toBeVisible();
    await expect(page.getByText("0 horários reservados neste dia.", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Abrir Piscina e Academia ↗", exact: true })).toHaveAttribute("href", "https://valle-piscina-academia.vercel.app");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(path.slice(1) + ".png"), fullPage: true });
    await page.getByRole("link", { name: "Próximo dia →", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Reservas do dia · 01/01/2027", exact: true })).toBeVisible();
    await page.goto(path + "?dia=2099-12-31");
    await expect(page.getByRole("link", { name: "Próximo dia →", exact: true })).toHaveCount(0);
    await page.goto(path + "?dia=2026-02-30");
    await expect(page.getByRole("status")).toContainText("Data inválida");
  }
  expect(external).toEqual([]);
});
