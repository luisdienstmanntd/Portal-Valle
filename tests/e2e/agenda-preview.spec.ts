import { test,expect } from "@playwright/test";
test("agenda desconhecida não informa dia vazio e navega por data",async({page})=>{
 await page.goto("/agenda?dia=2026-12-31");
 await expect(page.getByRole("heading",{name:"31/12/2026",exact:true})).toBeVisible();
 await expect(page.getByText("Conexão pendente",{exact:true})).toBeVisible();
 await expect(page.getByRole("heading",{name:"Agenda aguardando consulta",exact:true})).toBeVisible();
 await expect(page.getByText("Nenhuma sessão programada neste dia",{exact:true})).toHaveCount(0);
 await expect(page.getByRole("link",{name:"Piscina Em preparação",exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:test.info().outputPath("agenda-preview.png"),fullPage:true});
 await page.getByRole("link",{name:"Próximo dia →",exact:true}).click();await expect(page.getByRole("heading",{name:"01/01/2027",exact:true})).toBeVisible();
 await page.goto("/agenda?dia=2099-12-31");await expect(page.getByRole("link",{name:"Próximo dia →",exact:true})).toHaveCount(0);
 await page.goto("/agenda?dia=0000-01-01");await expect(page.getByRole("status")).toContainText("Data inválida");
});
