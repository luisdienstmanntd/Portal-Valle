import "server-only";

function httpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}
export function externalSystems() {
  return {
    facilities: httpsUrl(process.env.PORTAL_FACILITIES_URL ?? "https://agendamentosvalledincanto.vercel.app/recepcao"),
    osteria: httpsUrl(process.env.PORTAL_OSTERIA_URL ?? "https://osteriadilucca.web.app/"),
  };
}
