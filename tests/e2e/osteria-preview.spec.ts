import {expect,test} from "@playwright/test";
test("Osteria oferece sistema incorporado e acesso direto",async({page})=>{
 await page.goto("/osteria");await expect(page.getByRole("heading",{level:1,name:"Osteria",exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Abrir Osteria no Portal",exact:true})).toBeVisible();
 await expect(page.getByRole("link",{name:"Abrir em nova aba ↗"})).toHaveAttribute("href","https://osteriadilucca.web.app/");
 await expect(page.locator("iframe")).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
