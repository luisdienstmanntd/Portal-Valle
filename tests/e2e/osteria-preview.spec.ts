import {expect,test} from "@playwright/test";
test("Osteria oferece sistema incorporado e acesso direto",async({page})=>{
 await page.route("https://osteriadilucca.web.app/**",route=>route.fulfill({status:200,contentType:"text/html; charset=utf-8",body:"<h1>Osteria fictícia</h1>"}));
 await page.goto("/osteria");await expect(page.getByRole("heading",{level:1,name:"Osteria",exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Fechar sistema",exact:true})).toBeVisible();
 await expect(page.getByRole("link",{name:"Abrir em nova aba ↗"})).toHaveAttribute("href","https://osteriadilucca.web.app/");
 await expect(page.frameLocator("iframe").getByRole("heading",{name:"Osteria fictícia"})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

