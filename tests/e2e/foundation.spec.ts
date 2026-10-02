import { expect, test } from "@playwright/test";

test("a fundação responde com o nome do Portal", async ({ request }) => {
  const response = await request.get("/");

  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain("Portal Valle");
});
