import {expect,test} from "@playwright/test";
for(const [route,title] of [["/piscina","Piscina"],["/academia","Academia"]]) test(title+" usa o sistema atual sem carregar dados automaticamente",async({page})=>{
 await page.goto(route);await expect(page.getByRole("heading",{level:1,name:title,exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Abrir Piscina e Academia no Portal",exact:true})).toBeVisible();
 await expect(page.getByRole("link",{name:"Abrir em nova aba ↗"})).toHaveAttribute("href","https://agendamentosvalledincanto.vercel.app/recepcao");
 await expect(page.locator("iframe")).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
