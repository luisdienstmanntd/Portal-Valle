import { expect,test } from "@playwright/test";
test("Hoje coloca programação e reservas no mesmo local sem inventar atividades",async({page})=>{
 await page.route("https://osteriadilucca.web.app/**",route=>route.fulfill({status:200,contentType:"text/html; charset=utf-8",body:"<h1>Osteria fictícia</h1>"}));
 await page.goto("/hoje");
 const program=page.getByTestId("hotel-program");
 await expect(program.getByRole("heading",{name:"O que acontece hoje"})).toBeVisible();
 await expect(program.getByRole("status")).toContainText("acesso do Portal");
 await expect(program.getByText("Nenhuma atividade publicada para hoje.")).toHaveCount(0);
 await expect(program.getByRole("link",{name:"Cadastrar e organizar a semana"})).toBeVisible();
 for(const name of ["Piscina","Academia","Osteria","Cine, Pizza e atividades"]) await expect(page.locator(".quick-links").getByRole("heading",{name,exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator(".quick-links").getByRole("link").filter({hasText:"Osteria"}).click();
 await expect(page.locator("iframe[title='Sistema de Osteria']")).toBeVisible();
});
test("sistemas atuais abrem diretamente e permitem fechar e reabrir",async({page})=>{
 const external:string[]=[];
 await page.route("https://osteriadilucca.web.app/**",async route=>{external.push(route.request().url());await route.fulfill({status:200,contentType:"text/html; charset=utf-8",body:"<h1>Sistema fictício de teste</h1>"});});
 await page.goto("/osteria");
 await expect(page.locator("iframe[title='Sistema de Osteria']")).toHaveAttribute("src","https://osteriadilucca.web.app/");
 await expect(page.frameLocator("iframe").getByRole("heading",{name:"Sistema fictício de teste"})).toBeVisible();
 expect(external.length).toBeGreaterThan(0);
 await page.getByRole("button",{name:"Fechar sistema"}).click();await expect(page.locator("iframe")).toHaveCount(0);
 await page.getByRole("button",{name:"Abrir Osteria no Portal",exact:true}).click();
 await expect(page.frameLocator("iframe").getByRole("heading",{name:"Sistema fictício de teste"})).toBeVisible();
 await page.goto("/piscina");await expect(page.getByRole("link",{name:"Abrir em nova aba ↗"})).toHaveAttribute("href","https://agendamentosvalledincanto.vercel.app/recepcao");
});

