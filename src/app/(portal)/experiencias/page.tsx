import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, Badge, buttonClass } from "@/components/ui/primitives";
export default async function ExperiencesPage() {
  await guardPreparationPage("experiences.read");
  return <><PageHeading title="Experiências" description="Momentos que tornam a estadia especial." /><div className="session-grid"><Card className="session-card"><Badge>Somente adultos</Badge><h2>Cine Toscana</h2><p>8 pessoas · 4 puffs de casal</p><Link className={buttonClass()} href="/experiencias/cine-toscana">Ver Cine Toscana</Link></Card><Card className="session-card"><Badge>Em preparação</Badge><h2>Lora del Vino</h2><p>A degustação será preparada em uma próxima etapa.</p></Card></div></>;
}
