import {expect,test} from "@playwright/test";
for(const [route,title] of [["/piscina","Piscina"],["/academia","Academia"]]) test(title+" abre o sistema atual diretamente",async({page})=>{
 await page.route("https://agendamentosvalledincanto.vercel.app/**",route=>route.fulfill({status:200,contentType:"text/html; charset=utf-8",body:"<h1>Reservas fictícias</h1>"}));
 await page.goto(route);await expect(page.getByRole("heading",{level:1,name:title,exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Fechar sistema",exact:true})).toBeVisible();
 await expect(page.getByRole("link",{name:"Abrir em nova aba ↗"})).toHaveAttribute("href","https://agendamentosvalledincanto.vercel.app/recepcao");
 await expect(page.frameLocator("iframe").getByRole("heading",{name:"Reservas fictícias"})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

