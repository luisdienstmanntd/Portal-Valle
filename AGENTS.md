# Portal Valle — instruções operacionais

Escopo vigente: docs/ai/MASTER_REQUEST.md e ADR-020/021/022. Roteiro antigo arquivado; não retomar fases fora do objetivo.

Antes de alterar: ler `docs/ai/PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `PROGRESS.md`, `KNOWN_ISSUES.md` e o requisito aplicável de `MASTER_REQUEST.md`.

Executar `git status --short`, `git branch --show-current` e `git log --oneline -10`. Confirmar fase, branch, último commit verificado e pendências. Preservar alterações do usuário.

- Executar a reformulação já autorizada até concluir implementação, testes e documentação. Não acrescentar produtos ou novas integrações externas por iniciativa própria.
- Nunca alterar `luisdienstmanntd/Reservas-Piscina-Academia` ou `luisdienstmanntd/Gerenciador-de-Reservas`, seus bancos/deploys/credenciais, para viabilizar o Portal. Nesta entrega, abrir sistemas atuais em iframe/nova aba; sem acesso direto aos bancos externos.
- Portal tem GitHub, Vercel, Supabase/Auth, migrations e ENV próprios. Nunca usar seus recursos existentes como destino do Portal.
- Domínio puro; UI → aplicação → domínio/ports; infraestrutura implementa contratos úteis. Sem BaseRepository, GenericService ou abstrações cerimoniais.
- Validar entradas no servidor; autorização central e RLS; capacidade e idempotência protegidas atomicamente no banco.
- Data operacional: America/Sao_Paulo. Sem datas implícitas do servidor/navegador.
- Secrets nunca no repositório, browser ou logs. Somente dados fictícios nos testes. Não copiar dados pessoais externos.
- Investigar antes de alterar. Regras: comportamento validado, testes, schema, código, documentação, memória.
- Regressão: reproduzir, teste quando possível, corrigir, verificar e documentar.
- Commits pequenos Conventional Commits. Atualizar PROGRESS, CHANGELOG_AI, KNOWN_ISSUES e TEST_MATRIX; ADR quando relevante.
- Antes de concluir cada tarefa, chamar o subagente `.cursor/agents/portal-reviewer.md`, corrigir achados obrigatórios e obter `APROVADO TECNICAMENTE`. O parecer não autoriza próxima fase nem publicação externa.

Comandos: `npm run dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:integration`, `test:e2e`, `check`. `check` = lint + typecheck + unit; CI também `npm ci` e build. Nunca afirmar PASS sem execução. Integração/E2E apenas em ambientes de teste.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
