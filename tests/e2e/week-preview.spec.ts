import {test,expect} from "@playwright/test";
test("programação navega semanas e protege duplicação na prévia",async({page})=>{
 await page.goto("/programacao?semana=2026-12-31");
 await expect(page.getByRole("heading",{name:"28/12/2026 a 03/01/2027"})).toBeVisible();
 for(const name of ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"]) await expect(page.getByRole("heading",{name,exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Duplicar semana",exact:true})).toBeDisabled();
 await expect(page.getByRole("status")).toContainText("Prévia");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:test.info().outputPath("week-preview.png"),fullPage:true});
 await page.getByRole("link",{name:"Próxima semana →"}).click();
 await expect(page.getByRole("heading",{name:"04/01/2027 a 10/01/2027"})).toBeVisible();
 await page.goto("/programacao?semana=2026-02-30");await expect(page.getByText("Data inválida. Exibindo a semana atual do hotel.")).toBeVisible();
});
