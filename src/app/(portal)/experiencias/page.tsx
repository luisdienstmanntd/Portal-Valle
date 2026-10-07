import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, Badge, buttonClass } from "@/components/ui/primitives";
export default async function ExperiencesPage() {
  await guardPreparationPage("experiences.read");
  return <><PageHeading title="Experiências" description="Momentos que tornam a estadia especial." /><div className="session-grid"><Card className="session-card"><Badge>Vagas por adultos</Badge><h2>Cine Toscana</h2><p>8 adultos · 4 puffs de casal</p><Link className={buttonClass()} href="/experiencias/cine-toscana">Ver Cine Toscana</Link></Card><Card className="session-card"><Badge>Vagas por adultos</Badge><h2>La Vera Pizza</h2><p>20 pessoas · adultos e crianças</p><Link className={buttonClass()} href="/experiencias/la-vera-pizza">Ver La Vera Pizza</Link></Card><Card className="session-card"><Badge>Programação semanal</Badge><h2>Atividades do hotel</h2><p>Cadastre eventos, horários, locais, vagas e inscrições.</p><Link className={buttonClass()} href="/experiencias/programacao-hotel">Cadastrar atividade</Link></Card></div></>;
}
