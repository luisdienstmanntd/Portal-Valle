import {test,expect} from "@playwright/test";
test("Pizza mostra capacidade adulta e regras de observação sem liberar escrita na prévia",async({page})=>{
 await page.goto("/experiencias");
 await page.getByRole("link",{name:"Ver La Vera Pizza"}).click();
 await expect(page.getByRole("heading",{name:"La Vera Pizza",exact:true})).toBeVisible();
 await expect(page.getByRole("heading",{name:"12 vagas para adultos",exact:true})).toBeVisible();
 await expect(page.getByLabel("Evento",{exact:true})).toHaveValue("La Vera Pizza");
 await expect(page.getByLabel("Vagas para adultos",{exact:true})).toHaveValue("12");
 await expect(page.getByRole("button",{name:"Criar sessão",exact:true})).toBeDisabled();
 await expect(page.getByText("Crianças são registradas nas observações, com a idade, sem entrar na contagem de vagas.")).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:test.info().outputPath("pizza-preview.png"),fullPage:true});
});
