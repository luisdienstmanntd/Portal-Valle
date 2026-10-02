# Valle D'Incanto — Portal de Experiências

Nome curto: **Portal Valle**. Terceiro produto independente para a recepção do Hotel Valle D'Incanto, Gramado/RS.

## Estado atual

Fase 0: descoberta e planejamento concluída. A documentação detalhada foi autorizada para publicação no repositório GitHub público. A Fase 1 foi autorizada e está em desenvolvimento local. Ainda não há banco próprio, autenticação, integração ou deploy.

- Repositório: https://github.com/luisdienstmanntd/Portal-Valle
- Produção desejada, ainda não provisionada: https://portalvalle.vercel.app
- Relatório: [Fase 0](docs/architecture/PHASE_0_REPORT.md).
- Continuidade: [PROGRESS](docs/ai/PROGRESS.md) e [AGENTS](AGENTS.md).

## Limites permanentes

Piscina/Academia e Osteria continuam donos dos seus dados e independentes do Portal. As primeiras integrações serão exclusivamente de leitura, no servidor, com acesso restrito ainda a definir. Nenhum código desses sistemas deve ser importado em runtime.

Os repositórios `luisdienstmanntd/Reservas-Piscina-Academia` e `luisdienstmanntd/Gerenciador-de-Reservas`, seus bancos, domínios, credenciais e deploys não podem ser alterados sem autorização específica.

## Verificação nesta fase

Revisão de fontes GitHub com commits fixos, catálogos PostgreSQL em transações somente leitura, consistência documental e verificação de ausência de credenciais. Não houve scripts npm ou testes de aplicação na Fase 0. A matriz de testes descreve trabalho futuro, não resultados executados.

## Próxima etapa

Fase 1: fundação Next.js/TypeScript, lint, testes, CI, ENV, design tokens e cópia local do logo. Sem funcionalidades operacionais e sem integrações. Banco remoto novo apenas na Fase 3; autenticação na Fase 4.

