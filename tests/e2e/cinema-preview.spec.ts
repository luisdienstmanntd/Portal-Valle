import {test,expect} from "@playwright/test";
test("Cine mostra regras e formulários indisponíveis sem configuração",async({page})=>{
  await page.goto("/experiencias");
  await page.getByRole("link",{name:"Ver Cine Toscana"}).click();
  await expect(page.getByRole("heading",{name:"Cine Toscana",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"8 pessoas · 4 puffs de casal"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Criar sessão"})).toBeDisabled();
  await expect(page.getByLabel("Filme",{exact:true})).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Prévia");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:test.info().outputPath("cine-preview.png"),fullPage:true});
});
