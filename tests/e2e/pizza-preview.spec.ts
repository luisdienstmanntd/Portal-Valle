import {test,expect} from "@playwright/test";
test("Pizza mostra20pessoas e exceções justificadas sem liberar escrita na prévia",async({page})=>{
 await page.goto("/experiencias");
 await page.getByRole("link",{name:"Ver La Vera Pizza"}).click();
 await expect(page.getByRole("heading",{name:"La Vera Pizza",exact:true})).toBeVisible();
 await expect(page.getByRole("heading",{name:"20 pessoas · adultos e crianças",exact:true})).toBeVisible();
 await expect(page.getByLabel("Evento",{exact:true})).toHaveValue("La Vera Pizza");
 await expect(page.getByLabel("Vagas para pessoas (adultos e crianças)",{exact:true})).toHaveValue("20");
 await expect(page.getByRole("button",{name:"Criar sessão",exact:true})).toBeDisabled();
 await expect(page.getByText("Acima do limite, recepção ou gerência deve autorizar a exceção com justificativa.")).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:test.info().outputPath("pizza-preview.png"),fullPage:true});
});
