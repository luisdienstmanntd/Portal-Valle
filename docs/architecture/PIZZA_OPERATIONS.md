# La Vera Pizza

Fase 8 reutiliza o módulo de experiências: evento/local/horários, sessões publicadas/rascunho, inscrições, presença independente, observações e cancelamento. Capacidade inicial confirmada: 12 adultos. Crianças somente nas observações com idade, sem ocupar vagas. Lora terá 12 adultos, mas segue adiada. Sem financeiro.

Gerência/admin gerem sessões; recepção também gere inscrições. Server Actions validam sessão/permissão e Zod estrito. Wrappers Pizza limitam categoria gastronomy e slug la-vera-pizza. Helpers privados compartilhados serializam catálogo → sessão → inscrição, validam capacidade/versão, não permitem transferências e inserem receipt/auditoria atomicamente. Idempotência inclui actor/request/hash/categoria/slug/tipo. Presença e notas sobrevivem ao cancelamento. units=0 no modo persons; children=0 técnico. Observações e dados pessoais não entram na auditoria.

Capacidade por sessão pode ser reduzida respeitando ocupação; zero fecha vagas. Datas America/Sao_Paulo. no_show falha fechado até política definida. Prévia sem ENV é desabilitada; banco/Auth são validados somente em CI efêmero. Hosted, contas reais, retenção e backup continuam pendentes.
