# Valle D'Incanto — Portal de Experiências

Nome curto: **Portal Valle**. Terceiro produto independente para a recepção do Hotel Valle D'Incanto, Gramado/RS.

## Estado atual

Fases 0–5 concluídas e publicadas. A Fase 3 foi validada em CI com Supabase independente efêmero, migrations/RLS, clientes e testes de banco. Homologação hospedada adiada pelo proprietário devido ao limite gratuito; nenhum banco existente será usado. Auth/RBAC individual foi validado em CI isolado. A prévia não possui ENV ou contas reais; ainda não há integração externa ou deploy.

- Repositório: https://github.com/luisdienstmanntd/Portal-Valle
- Produção desejada, ainda não provisionada: https://portalvalle.vercel.app
- Relatórios: [Fase 0](docs/architecture/PHASE_0_REPORT.md), [Fase 1](docs/architecture/PHASE_1_REPORT.md), [Fase 2](docs/architecture/PHASE_2_REPORT.md) e [Fase 3](docs/architecture/PHASE_3_REPORT.md).
- Continuidade: [PROGRESS](docs/ai/PROGRESS.md) e [AGENTS](AGENTS.md).

## Limites permanentes

Piscina/Academia e Osteria continuam donos dos seus dados e independentes do Portal. As primeiras integrações serão exclusivamente de leitura, no servidor, com acesso restrito ainda a definir. Nenhum código desses sistemas deve ser importado em runtime.

Os repositórios `luisdienstmanntd/Reservas-Piscina-Academia` e `luisdienstmanntd/Gerenciador-de-Reservas`, seus bancos, domínios, credenciais e deploys não podem ser alterados sem autorização específica.

## Desenvolvimento local

Use Node 24 (`.nvmrc`), `npm ci` e `npm run dev`. Para verificar: `npm run check`, `npm run build`, `npx playwright install chromium` e `npm run test:e2e` depois do build. `/` redireciona para `/hoje`. As rotas mostram a estrutura visual e estados de preparação; a operação será implementada nas próximas fases. Consulte [DESIGN_SYSTEM](docs/architecture/DESIGN_SYSTEM.md) para os componentes e fontes locais.

O teste E2E usa Playwright contra um servidor Next em `127.0.0.1:3100`. No Windows, o Playwright pode ficar preso ao encerrar automaticamente o servidor; iniciar `npm run start -- --hostname 127.0.0.1 --port 3100` separadamente antes do E2E permite o teste terminar normalmente.

## Verificação da descoberta

Revisão de fontes GitHub com commits fixos, catálogos PostgreSQL em transações somente leitura, consistência documental e verificação de ausência de credenciais. Não houve scripts npm ou testes de aplicação na Fase 0. A matriz de testes descreve trabalho futuro, não resultados executados.

## Continuidade atual

Fases6/8 Cine/Pizza, programação semanal9 e agenda10 concluídas; Lora adiada. Preparação Facilities11 e Osteria12 aprovada tecnicamente, com factories desabilitadas por falta de acesso restrito comprovado. Fase13 Home reúne contratos mínimos e estados independentes, em validação final. Consulte [PROGRESS](docs/ai/PROGRESS.md), [HOME_TODAY_OPERATIONS](docs/architecture/HOME_TODAY_OPERATIONS.md) e [SUPABASE_SETUP](docs/architecture/SUPABASE_SETUP.md). Nenhuma integração externa ou produção foi habilitada.
