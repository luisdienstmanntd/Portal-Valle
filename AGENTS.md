# Portal Valle — instruções operacionais

Antes de alterar: ler `docs/ai/PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `PROGRESS.md`, `KNOWN_ISSUES.md` e o requisito aplicável de `MASTER_REQUEST.md`.

Executar `git status --short`, `git branch --show-current` e `git log --oneline -10`. Confirmar fase, branch, último commit verificado e pendências. Preservar alterações do usuário.

- Executar uma fase por vez. Ao término, verificar, documentar, commit, relatório e PARAR. Não iniciar a próxima sem autorização explícita.
- Nunca alterar `luisdienstmanntd/Reservas-Piscina-Academia` ou `luisdienstmanntd/Gerenciador-de-Reservas`, seus bancos/deploys/credenciais, para viabilizar o Portal. Integrações iniciais somente leitura.
- Portal tem GitHub, Vercel, Supabase/Auth, migrations e ENV próprios. Nunca usar seus recursos existentes como destino do Portal.
- Domínio puro; UI → aplicação → domínio/ports; infraestrutura implementa contratos úteis. Sem BaseRepository, GenericService ou abstrações cerimoniais.
- Validar entradas no servidor; autorização central e RLS; capacidade e idempotência protegidas atomicamente no banco.
- Data operacional: America/Sao_Paulo. Sem datas implícitas do servidor/navegador.
- Secrets nunca no repositório, browser ou logs. Somente dados fictícios nos testes. Não copiar dados pessoais externos.
- Investigar antes de alterar. Regras: comportamento validado, testes, schema, código, documentação, memória.
- Regressão: reproduzir, teste quando possível, corrigir, verificar e documentar.
- Commits pequenos Conventional Commits. Atualizar PROGRESS, CHANGELOG_AI, KNOWN_ISSUES e TEST_MATRIX; ADR quando relevante.

Fase 0: somente documentos. Comandos npm ainda não existem. Na Fase 1 disponibilizar `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:integration`, `test:e2e`, `check`. `check` = lint + typecheck + unit; CI também `npm ci` e build. Nunca afirmar PASS sem execução. Integração/E2E apenas em ambientes de teste.

