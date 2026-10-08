# Arquitetura vigente

ADR-022 acrescenta modo público explícito no banco: proxy cria/reutiliza sessão anônima automática, trigger atribui perfil operacional fixo, autorização checa modo público em cada RPC/leitura e bloqueia administração/auditoria para anônimos. SSR permanece dinâmico/no-store, sem chave privilegiada. Interface omite login/logout para visitante público e apresenta indisponibilidade com retry em falha de sessão. Iframes agora carregam ao abrir a aba; origem mantém login/cookies e alternativa nova aba. Os parágrafos antigos sobre carregamento somente por clique/identidade pessoal são substituídos neste modo.

## Fluxos

- Browser → Portal Next.js: navegação, Hoje, Programação, Cine/Pizza e atividades.
- Browser → iframe HTTPS do sistema atual: reservas Piscina/Academia/Osteria usando autenticação da origem; Portal não lê DOM nem captura credenciais. Sem banco externo ou compartilhamento de sessão. Incorporação carregada imediatamente ao abrir a aba, alternativa em nova aba sempre disponível.
- Portal servidor → Supabase próprio: catálogo, sessões, inscrições, Auth e auditoria. Cliente público com sessão técnica anônima no modo público; nenhuma chave administrativa.

Hoje e Programação usam loadWeek sobre experience_occurrences. Home exibe published/completed; cadastro conserva rascunhos e canceladas. Salvar/cancelar invalida Hoje, Agenda e Programação. Consultas no-store; estado sem configuração/falha é distinto de vazio. Fuso America/Sao_Paulo.

## Reuso

Três fluxos explícitos: cinema, pizza, program. Program usa catálogo programacao-hotel/categoryother e título livre, capacidade configurada por sessão. Reusa domínio, formulários e helpers transacionais; wrappers RPC vinculam categoria/slug, não aceitam mutar outro catálogo. Cine usa puffs; Pizza conta adultos+crianças; demais atividades preservam contagem de adultos existente.

Migration20261007200329 concede experiences.manage/weekly_program.manage a recepção ativa, alinha SQL/TypeScript e acrescenta programação livre e regras Pizza. Helpers privados permanecem sem EXECUTE do cliente. Mutations exigem auth.uid, sessão viva, idempotência, versão e locks. Auditoria append-only inclui exception_reason e ator; não inclui nome/apartamento/observações.

Pizza permanece com capacidade20; booking acima da capacidade só aceita justificativa10–1000caracteres. A razão é gravada na reserva e auditoria; a transação não modifica capacidade. Edição/reativação reavalia ocupação; exclusão lógica cancela e libera vagas. Mudança de sessão não pode reduzir abaixo da ocupação real.

## Limites

Adapters diretos externos anteriores ficam preparados/desconectados, fora do caminho das telas incorporadas. Não retomar ADR-019/plano de escrita sem nova solicitação. Bancos externos nunca dependem do Portal.

Autenticação incorporada pode falhar por políticas do browser/origem; não inferir êxito pelo evento load do iframe. Verificação visual de tela de login não comprova login ou reserva. Supabase/Auth próprios configurados e entrada pública automática validada no domínio principal.

Arquitetura anterior preservada em ../history/ARCHITECTURE_BEFORE_RECEPTION_SCOPE.md. Docs de fases antigas são evidências históricas; não são roteiro vigente.
