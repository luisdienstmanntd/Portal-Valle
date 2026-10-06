import "server-only";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { ExperienceAgendaProvider } from "@/modules/agenda/infrastructure/experience-provider";
import { facilitiesReader } from "@/modules/facilities/infrastructure/reader";
import { osteriaReader } from "@/modules/osteria/infrastructure/reader";
import { readHomeDay } from "../application/read-home-day";

export async function loadHomeDay(date: string) {
  // Authorize every domain before constructing or invoking any reader.
  await guardPreparationPage("experiences.read");
  await guardPreparationPage("facilities.read");
  await guardPreparationPage("osteria.read");
  return readHomeDay({ date, experienceProvider: ExperienceAgendaProvider(), facilities: facilitiesReader(),
    osteria: osteriaReader(), now: () => new Date() });
}
