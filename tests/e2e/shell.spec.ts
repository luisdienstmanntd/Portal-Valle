import { expect, test } from "@playwright/test";

const routes = [
  ["/hoje", "Hoje"], ["/agenda", "Agenda"], ["/programacao", "Programação"],
  ["/experiencias", "Experiências"], ["/piscina", "Piscina"], ["/academia", "Academia"],
  ["/osteria", "Osteria"], ["/configuracoes", "Configurações"],
] as const;

test("o menu acessa as oito áreas e indica a página atual", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/hoje$/);
  const mobile = page.viewportSize()!.width < 768;
  for (const [href, title] of routes) {
    if (mobile) await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
    const navigation = page.getByRole("navigation", { name: "Navegação principal" });
    const menuName = href === "/experiencias" ? "Cine, Pizza e atividades" : title;
    const link = navigation.getByRole("link", { name: menuName, exact: true });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
    if (mobile) {
      await expect(page.getByRole("dialog", { name: "Portal Valle" })).not.toBeVisible();
      await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
    }
    await expect(navigation.getByRole("link", { name: menuName, exact: true })).toHaveAttribute("aria-current", "page");
    if (mobile) await page.keyboard.press("Escape");
  }
});

test("o diálogo mantém o foco, fecha com Esc e devolve o foco à origem", async ({ page }) => {
  await page.goto("/configuracoes");
  const trigger = page.getByRole("button", { name: "Ajuda de navegação" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Como navegar pelo Portal" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Fechar", exact: true })).toBeFocused();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.closest("dialog") !== null)).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Fechar", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
  await expect(trigger).toBeFocused();
});

test("a interface cabe na tela e os alvos principais têm 44px", async ({ page, baseURL }, testInfo) => {
  const errors: string[] = [];
  const externalRequests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin) externalRequests.push(request.url());
  });
  await page.goto("/hoje");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const links = page.viewportSize()!.width < 768
    ? page.getByRole("button", { name: "Abrir menu de navegação" })
    : page.getByRole("navigation").getByRole("link");
  for (const link of await links.all()) {
    const bounds = await link.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: testInfo.outputPath(`hoje-${testInfo.project.name}.png`), fullPage: true });
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
  if (page.viewportSize()!.width < 768) {
    await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
    const dialog = page.getByRole("dialog", { name: "Portal Valle" });
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", { name: "Fechar menu de navegação" });
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: "Configurações" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Abrir menu de navegação" })).toBeFocused();
  }
});

test("teclado pula o menu e endereço desconhecido oferece retorno", async ({ page }) => {
  await page.goto("/hoje");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Ir para o conteúdo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  const response = await page.goto("/pagina-inexistente");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  await page.getByRole("link", { name: "Ir para Hoje", exact: true }).click();
  await expect(page).toHaveURL(/\/hoje$/);
});
