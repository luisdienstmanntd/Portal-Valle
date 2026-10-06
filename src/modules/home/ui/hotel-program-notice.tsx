import { Card, Badge } from "@/components/ui/primitives";
import { addDays } from "@/lib/hotel-date";

// Conteúdo fornecido pelo proprietário, sem remetentes/destinatários do log.
const days = [
  { label: "Sexta-feira", welcome: true, activities: [
    ["08h às 11h", "Café da manhã"],
    ["15h30", "Alchemy Bar Workshop · Taverna La Martina · Máximo 10 lugares"],
    ["16h30", "Chá da tarde com estação de alimentos funcionais"],
    ["20h30 às 22h30", "Piano & Jazz · Osteria di Lucca"],
  ] },
  { label: "Sábado", welcome: true, activities: [
    ["06h às 12h", "Personal Training · Academia"],
    ["08h às 11h", "Café da manhã com piano ao vivo e estação de alimentos funcionais"],
    ["09h às 10h30", "Aquaflow · Piscina · Máximo 8 lugares"],
    ["15h30", "Sound Healing & Relaxamento · Taverna La Martina · Máximo 10 lugares"],
    ["16h30", "Chá da tarde com estação de alimentos funcionais"],
    ["20h30 às 22h30", "Piano & Jazz · Osteria di Lucca"],
  ] },
  { label: "Domingo", welcome: false, activities: [
    ["08h às 11h", "Café da manhã ao som de piano e estação de alimentos funcionais"],
    ["16h30", "Chá da tarde e estação de alimentos funcionais"],
    ["19h30", "La Vera Pizza Napoletana"],
  ] },
  { label: "Segunda-feira", welcome: false, activities: [["08h às 12h", "Brunch do Valle"]] },
];

export function HotelProgramNotice({ startDate, today }: { startDate: string; today: string }) {
  const dateLabel = (date: string) => date.split("-").reverse().join("/");
  const endDate = addDays(startDate, 3);
  return <Card className="hotel-program" data-testid="hotel-program">
    <div className="hotel-program-heading"><div><p className="eyebrow">PROGRAMAÇÃO DO HOTEL</p><h2>Bem-estar no Valle</h2></div>
      <Badge>{dateLabel(startDate)} a {dateLabel(endDate)}</Badge></div>
    <p className="hotel-program-intro">Encontros, sabores e momentos para aproveitar o Valle.</p>
    {today > endDate && <p className="operation-notice">Programação encerrada. Confira as próximas atividades com a equipe.</p>}
    <div className="hotel-program-days">{days.map((day, index) => <details className="hotel-program-day" key={day.label} open={index === 0}>
      <summary><span>{day.label}</span><span>{dateLabel(addDays(startDate, index))}</span></summary>
      {day.welcome && <p className="hotel-program-welcome">Boas-vindas especiais com sucos naturais e doces fitness.</p>}
      <ul>{day.activities.map(([time, activity]) => <li key={`${time}-${activity}`}><strong>{time}</strong><span>{activity}</span></li>)}</ul>
    </details>)}</div>
  </Card>;
}
