# Valle D'Incanto — Portal de Experiências

Nome curto: **Portal Valle**. Terceiro produto independente para a recepção do Hotel Valle D'Incanto, Gramado/RS.

## Estado atual

Fase 0: descoberta e planejamento concluída. A Fase 1 criou a fundação local do Next.js com TypeScript strict, Tailwind, testes, CI, validação de ENV e logo próprio. Ainda não há banco próprio, autenticação, integração ou deploy.

- Repositório: https://github.com/luisdienstmanntd/Portal-Valle
- Produção desejada, ainda não provisionada: https://portalvalle.vercel.app
- Relatório: [Fase 0](docs/architecture/PHASE_0_REPORT.md).
- Continuidade: [PROGRESS](docs/ai/PROGRESS.md) e [AGENTS](AGENTS.md).

## Limites permanentes

Piscina/Academia e Osteria continuam donos dos seus dados e independentes do Portal. As primeiras integrações serão exclusivamente de leitura, no servidor, com acesso restrito ainda a definir. Nenhum código desses sistemas deve ser importado em runtime.

Os repositórios `luisdienstmanntd/Reservas-Piscina-Academia` e `luisdienstmanntd/Gerenciador-de-Reservas`, seus bancos, domínios, credenciais e deploys não podem ser alterados sem autorização específica.

## Desenvolvimento local

Use Node 24 (`.nvmrc`), `npm ci` e `npm run dev`. Para verificar: `npm run check`, `npm run build` e `npm run test:e2e` depois do build. A página inicial é apenas um marco de fundação; as telas operacionais pertencem às fases seguintes.

O teste E2E usa Playwright contra um servidor Next em `127.0.0.1:3100`. No Windows, o Playwright pode ficar preso ao encerrar automaticamente o servidor; iniciar `npm run start -- --hostname 127.0.0.1 --port 3100` separadamente antes do E2E permite o teste terminar normalmente.

## Verificação da descoberta

Revisão de fontes GitHub com commits fixos, catálogos PostgreSQL em transações somente leitura, consistência documental e verificação de ausência de credenciais. Não houve scripts npm ou testes de aplicação na Fase 0. A matriz de testes descreve trabalho futuro, não resultados executados.

## Próxima etapa

Fase 2: design system e shell operacional após autorização do proprietário. Banco remoto novo apenas na Fase 3; autenticação na Fase 4.
