# Portal Valle — Portal da Recepção

Um só local para acompanhar o dia do hotel e trabalhar com reservas.

- Hoje: programação do dia e semana, atalhos para reservas.
- Programação: recepção/gerência cadastra e publica atividades com vagas e inscrições; a Home lê a mesma fonte.
- Cine/Pizza: sessões e inscrições próprias. Pizza20pessoas incluindo crianças; exceções justificadas e auditadas.
- Piscina/Academia e Osteria: sistemas atuais incorporados, com alternativa em nova aba.

Requisitos: [MASTER_REQUEST](docs/ai/MASTER_REQUEST.md). Continuidade: [PROGRESS](docs/ai/PROGRESS.md). Arquitetura: [ARCHITECTURE](docs/ai/ARCHITECTURE.md).

## Desenvolvimento

Node24, npm ci, npm run dev. / redireciona para /hoje. npm run check valida lint/TypeScript/unitários; npm run build compila. Playwright usa127.0.0.1:3100. PORTAL_NEXT_DIST_DIR=.next-verify mantém build de verificação separado da prévia.

Site: https://portal-valle-eight.vercel.app/hoje. Acesso inicialmente livre, sem e-mail ou senha, conforme autorização expressa do proprietário. Programação e inscrições usam Supabase exclusivo do Portal com nove migrations. Visitantes não acessam configurações administrativas. Sem ENV, interface local continua somente prévia.

Sistemas atuais: https://agendamentosvalledincanto.vercel.app/recepcao e https://osteriadilucca.web.app/. Login/cookies de origem podem exigir nova aba. Abrir uma tela não permite ao Portal obter suas reservas ou afirmar disponibilidade automaticamente.

Programação fixa09–12/10 anterior preservada como referência histórica; a programação vigente passa a ser cadastrada pela equipe pelo Portal publicado.

Sem mudanças nos sistemas atuais, credenciais, bancos ou deploys. Estadias, PMS, relatórios, portal do hóspede e roadmap antigo fora do escopo vigente.
