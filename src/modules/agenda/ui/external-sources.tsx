import Link from "next/link";
import { Card,Badge } from "@/components/ui/primitives";
export function ExternalSources() {
 return <Card className="operation-panel"><h2>Outras áreas do hotel</h2><p>Piscina, Academia e Osteria ainda não estão conectadas à agenda do Portal.</p><div className="agenda-external-links">{[{name:"Piscina",href:"/piscina"},{name:"Academia",href:"/academia"},{name:"Osteria",href:"/osteria"}].map(area=><Link className="agenda-external-link" href={area.href} key={area.href}><span>{area.name}</span><Badge>Em preparação</Badge></Link>)}</div></Card>;
}
