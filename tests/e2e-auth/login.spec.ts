import { test, expect, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { createChunks, combineChunks, stringFromBase64URL, stringToBase64URL } from "@supabase/ssr";
const fixture = JSON.parse(readFileSync("work/auth-fixtures.json", "utf8")) as {
  password: string; users: Record<string, { email: string; id: string }>;
};
async function login(page: Page, name: string, password = fixture.password) {
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill(fixture.users[name].email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

async function experienceFlow(page:Page,slug:string,label:string,title:string,occupied:string,empty:string) {
 await page.goto('/experiencias/'+slug);
 const session=page.getByRole('form',{name:'Nova sessão',exact:true});
 await session.getByLabel(label,{exact:true}).fill(title);
 await session.getByLabel('Local',{exact:true}).fill('Local fictício interface');
 await session.getByLabel('Início · horário de Gramado').fill('2026-10-10T19:30');
 await session.getByLabel('Fim · horário de Gramado').fill('2026-10-10T21:30');
 await session.getByLabel('Disponibilidade').selectOption('published');
 await session.getByRole('button',{name:'Criar sessão',exact:true}).click();
 await expect(page.getByRole('heading',{name:title,exact:true,level:1})).toBeVisible();
 const booking=page.getByRole('form',{name:'Nova inscrição',exact:true});
 await booking.getByLabel('Apartamento',{exact:true}).fill('TEST');
 await booking.getByLabel('Nome do hóspede').fill('Pessoa fictícia interface');
 await booking.getByLabel('Adultos',{exact:true}).fill('3');
 await booking.getByLabel('Observações',{exact:true}).fill('CHD 2 anos');
 await expect(booking.getByLabel('Crianças',{exact:true})).toHaveCount(0);
 await booking.getByRole('button',{name:'Reservar',exact:true}).click();
 await expect(page.getByRole('heading',{name:occupied,exact:true})).toBeVisible();
 await expect(page.getByText('Observações: CHD 2 anos',{exact:true})).toBeVisible();
 await page.getByText('Editar inscrição e presença',{exact:true}).click();
 const edit=page.getByRole('form',{name:'Editar inscrição de Pessoa fictícia interface',exact:true});
 await edit.getByLabel('Presença',{exact:true}).selectOption('present');
 await edit.getByRole('button',{name:'Salvar inscrição',exact:true}).click();
 await expect(page.getByText('Reservada · Presente',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Cancelar inscrição',exact:true}).click();
 await page.getByRole('alertdialog',{name:'Cancelar esta inscrição?',exact:true}).getByRole('button',{name:'Confirmar cancelamento',exact:true}).click();
 await expect(page.getByRole('heading',{name:empty,exact:true})).toBeVisible();
 await expect(page.getByText('Cancelada · Presente',{exact:true})).toBeVisible();
 const reactivate=page.getByRole('form',{name:'Editar inscrição de Pessoa fictícia interface',exact:true}).getByRole('button',{name:'Reativar inscrição',exact:true});
 if(!(await reactivate.isVisible()))await page.locator('summary').filter({hasText:'Reativar inscrição'}).click();
 await expect(reactivate).toBeVisible();await reactivate.click();
 await expect(page.getByRole('heading',{name:occupied,exact:true})).toBeVisible();
 await expect(page.getByText('Observações: CHD 2 anos',{exact:true})).toBeVisible();
}

test("anônimo redirecionado, login, reload e logout", async ({ page }) => {
  await page.goto("/hoje"); await expect(page).toHaveURL(/\/login$/);
  await login(page, "recepcao"); await expect(page).toHaveURL(/\/hoje$/);
  await expect(page.getByRole("heading", { name: "Hoje", exact: true })).toBeVisible();
  const response = await page.reload();
  expect(response?.headers()["cache-control"]).toContain("no-store");
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/agenda"); await expect(page).toHaveURL(/\/login$/);
});

test("senha incorreta, perfil inativo e sem vínculo não entram", async ({ page }) => {
  for (const [name, password] of [["recepcao", "incorrect-synthetic-password"], ["inactive", fixture.password], ["unlinked", fixture.password]]) {
    await login(page, name, password);
    await expect(page.getByRole("alert", { name: "Erro ao entrar" })).toHaveText("Não foi possível entrar. Confira seus dados e tente novamente.");
    await page.goto("/hoje"); await expect(page).toHaveURL(/\/login$/);
  }
});

test("proxy renova sessão e devolve cookies com cache privado", async ({ page, context }) => {
  await login(page, "recepcao"); await expect(page).toHaveURL(/\/hoje$/);
  const cookies = await context.cookies();
  const original = cookies.find(cookie => /^sb-.*-auth-token(?:\.\d+)?$/.test(cookie.name))!;
  const key = original.name.replace(/\.\d+$/, "");
  const encoded = (await combineChunks(key, name => cookies.find(cookie => cookie.name === name)?.value))!;
  const session = JSON.parse(stringFromBase64URL(encoded.replace(/^base64-/, "")));
  session.expires_at = Math.floor(Date.now() / 1000) - 300;
  await context.clearCookies({ name: /^sb-.*-auth-token(?:\.\d+)?$/ });
  await context.addCookies(createChunks(key, "base64-" + stringToBase64URL(JSON.stringify(session)))
    .map(chunk => ({ ...original, ...chunk })));
  const response = await page.reload();
  await expect(page).toHaveURL(/\/hoje$/);
  expect(response?.headers()["cache-control"]).toContain("no-store");
  const renewedCookies = await context.cookies();
  const renewed = (await combineChunks(key, name => renewedCookies.find(cookie => cookie.name === name)?.value))!;
  const renewedSession = JSON.parse(stringFromBase64URL(renewed.replace(/^base64-/, "")));
  expect(renewedSession.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
  await page.goto("/agenda"); await expect(page).toHaveURL(/\/agenda$/);
});

for (const name of ["recepcao", "gerencia", "admin"]) {
  test(`${name}: área administrativa exige permissão no servidor`, async ({ page }) => {
    await login(page, name); await expect(page).toHaveURL(/\/hoje$/);
    if (name !== "admin") await expect(page.getByRole("navigation").getByRole("link", { name: "Configurações" })).toHaveCount(0);
    if (name === "gerencia") {
      test.setTimeout(90_000);
      await experienceFlow(page,"cine-toscana","Filme","Filme fictício interface","2 / 4 puffs · 3 / 8 adultos","0 / 4 puffs · 0 / 8 adultos");
      await experienceFlow(page,"la-vera-pizza","Evento","Pizza fictícia interface","3 / 12 adultos","0 / 12 adultos");
      await page.goto('/programacao?semana=2026-10-05');
      await expect(page.locator('.week-session').filter({hasText:'Filme fictício interface'}).first()).toBeVisible();
      await expect(page.locator('.week-session').filter({hasText:'Pizza fictícia interface'}).first()).toBeVisible();
      const target=test.info().project.name.includes('desktop')?'2027-03-01':'2027-03-08';
      await page.getByLabel('Segunda-feira da semana de destino').fill(target);
      await page.getByRole('button',{name:'Duplicar semana',exact:true}).click();
      await page.getByRole('alertdialog',{name:'Duplicar esta semana?',exact:true}).getByRole('button',{name:'Confirmar duplicação',exact:true}).click();
      await expect(page).toHaveURL(new RegExp('semana='+target));
      const copy=page.locator('.week-session').filter({hasText:'Pizza fictícia interface'}).first();
      await expect(copy).toContainText('Rascunho');
      await copy.click();
      await expect(page.getByRole('heading',{name:'0 / 12 adultos',exact:true})).toBeVisible();
      await expect(page.getByText('Observações: CHD 2 anos',{exact:true})).toHaveCount(0);
      await page.getByText('Editar sessão',{exact:true}).click();
      const sessionEdit=page.getByRole('form',{name:'Editar sessão',exact:true});
      const editedTitle='Pizza duplicada editada '+test.info().project.name;
      await sessionEdit.getByLabel('Evento',{exact:true}).fill(editedTitle);
      await sessionEdit.getByRole('button',{name:'Salvar sessão',exact:true}).click();
      await expect(page.getByRole('heading',{name:editedTitle,exact:true})).toBeVisible();
      await page.goto('/programacao?semana='+target);
      const editedCard=page.locator('.week-session').filter({hasText:editedTitle});
      await expect(editedCard).toBeVisible(); await editedCard.click();
      await page.getByRole('button',{name:'Cancelar sessão',exact:true}).click();
      await page.getByRole('alertdialog',{name:'Cancelar esta sessão?',exact:true}).getByRole('button',{name:'Confirmar cancelamento',exact:true}).click();
      await expect(page.getByRole('heading',{name:editedTitle,exact:true})).toBeVisible();
      await page.goto('/programacao?semana='+target);
      await expect(page.locator('.week-session').filter({hasText:editedTitle})).toContainText('Cancelada');
      const daily=JSON.parse(readFileSync('work/daily-agenda-fixtures.json','utf8')) as {date:string;cinema:string;pizza:string};
      await page.goto('/hoje');
      await expect(page.locator('.daily-timeline').getByRole('heading',{name:'Agenda fictícia Cine',exact:true})).toBeVisible();
      await expect(page.locator('.daily-timeline').getByRole('heading',{name:'Agenda fictícia Pizza',exact:true})).toBeVisible();
      await expect(page.getByText('Pessoa privada fictícia da agenda',{exact:true})).toHaveCount(0);
      await expect(page.getByText('TEST-AGENDA',{exact:true})).toHaveCount(0);
      await page.goto('/agenda?dia='+daily.date);
      await expect(page.locator('.daily-timeline').getByRole('heading',{name:'Agenda fictícia Pizza',exact:true})).toBeVisible();
      await page.locator('.timeline-entry').filter({hasText:'Agenda fictícia Pizza'}).click();
      await expect(page).toHaveURL(new RegExp('/experiencias/la-vera-pizza/'+daily.pizza));
      await expect(page.getByText('Pessoa privada fictícia da agenda · Apto TEST-AGENDA',{exact:true})).toBeVisible();
      await page.goto('/agenda?dia=2029-05-01');
      await expect(page.getByRole('heading',{name:'Nenhuma sessão programada neste dia',exact:true})).toBeVisible();
    }
    if (name === "recepcao") {
      const cinema = JSON.parse(readFileSync("work/cinema-fixtures.json", "utf8")) as { occurrenceId: string };
      await page.goto(`/experiencias/cine-toscana/${cinema.occurrenceId}`);
      await expect(page.getByRole("form", { name: "Nova inscrição", exact: true })).toBeVisible();
      await expect(page.getByText("Editar sessão", { exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Cancelar sessão", exact: true })).toHaveCount(0);
    }
    await page.goto("/configuracoes");
    if (name === "admin") await expect(page.getByRole("heading", { name: "Configurações", exact: true })).toBeVisible();
    else { await expect(page).toHaveURL(/\/acesso-negado$/); await expect(page.getByRole("heading", { name: "Acesso restrito" })).toBeVisible(); }
  });
}

test("sessão revogada invalida JWT existente também no banco", async ({ page }) => {
  await login(page, "recepcao"); await expect(page).toHaveURL(/\/hoje$/);
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email: fixture.users.recepcao.email, password: fixture.password });
  expect(error).toBeNull();
  const jwt = data.session!.access_token;
  const before = await client.from("portal_settings").select("timezone"); expect(before.data).toHaveLength(1);
  // Only the CI-local synthetic user's sessions are removed. No hosted connection allowed.
  expect(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF).toBe("local");
  writeFileSync("work/revoke-session.sql", `delete from auth.sessions where user_id='${fixture.users.recepcao.id}';`);
  execFileSync("npx", ["supabase", "db", "query", "--local", "--file", "work/revoke-session.sql"], { stdio: ["ignore", "ignore", "inherit"] });
  const stale = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${jwt}` } }, auth: { persistSession: false },
  });
  const denied = await stale.from("portal_settings").select("timezone"); expect(denied.data).toEqual([]);
  await page.reload(); await expect(page).toHaveURL(/\/login$/);
  await page.goto("/experiencias"); await expect(page).toHaveURL(/\/login$/);
});
