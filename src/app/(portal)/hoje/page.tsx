import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Button } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/icon";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { hotelToday } from "@/lib/hotel-date";
import { HomeProgram } from "@/modules/weekly-program/ui/home-program";
export const dynamic="force-dynamic";
const shortcuts:{href:string;name:string;description:string;icon:IconName}[]=[
  {href:"/piscina",name:"Piscina",description:"Consultar horários e fazer reservas.",icon:"pool"},
  {href:"/academia",name:"Academia",description:"Consultar horários e fazer reservas.",icon:"gym"},
  {href:"/osteria",name:"Osteria",description:"Acompanhar o restaurante e reservar.",icon:"dining"},
  {href:"/experiencias",name:"Cine, Pizza e atividades",description:"Consultar vagas e inscrever hóspedes.",icon:"sparkles"},
];
export default async function TodayPage() {
  await guardPreparationPage();
  const date=hotelToday(new Date());
  return <>
    <PageHeading title="Hoje" description={`Tudo para a recepção · ${date.split("-").reverse().join("/")}`} action={<form action="/hoje"><Button type="submit" variant="secondary">Atualizar dia</Button></form>}/>
    <HomeProgram date={date}/>
    <div className="section-heading"><h2>Reservas</h2><span>Acesso aos sistemas do hotel</span></div>
    <div className="quick-links">{shortcuts.map(item=><Link key={item.href} href={item.href} className="quick-card"><span className="quick-icon"><Icon name={item.icon}/></span><div><h3>{item.name}</h3><p>{item.description}</p></div><Icon name="arrow"/></Link>)}</div>
  </>;
}
