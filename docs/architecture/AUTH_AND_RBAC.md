# Auth e permissões — Fase 4

Supabase Auth pertence exclusivamente ao Portal. Hosted permanece adiado por escolha do proprietário; testes reais usam somente stack efêmero de CI. Sem credenciais de hóspedes/equipe reais e sem uso dos bancos legados.

## Identidade e autorização

`portal_profiles` aponta para `auth.users.id`, com role recepcao/gerencia/admin e active inicialmente false. Não há trigger que promova novos usuários nem permissão de INSERT/UPDATE/DELETE pelo cliente. Provisionamento inicial exige conta criada administrativamente e linha de perfil atribuída via SQL autorizado, com role/active explícitos. Signup público e anônimo estão desabilitados na stack local. Repetir configuração no futuro hosted; config.toml não configura SaaS.

`private.has_permission` é um lookup restrito SECURITY DEFINER, schema não exposto e search_path vazio. Precisa de auth.uid, session_id pertencente ao mesmo usuário em auth.sessions, sessão não expirada por not_after e perfil ativo. Retorna somente boolean, sem identificador arbitrário fornecido pelo cliente. EXECUTE apenas authenticated. Permissões não vêm de user_metadata/app_metadata nem de role enviado por formulário. Perfil lido do banco em cada requisição permite revogação imediata.

Matriz central em `src/modules/auth/domain/permissions.ts`, equivalente no SQL e testada por todos os papéis:

- Todos os perfis ativos: portal.read, experiences.read, facilities.read, osteria.read.
- Gerência/admin: experiences.manage, weekly_program.manage, reports.read.
- Admin: settings.manage.
- Inativo, sem perfil ou sessão revogada: nenhum acesso.

As permissões de experiências/programação/relatórios estão preparadas; funcionalidades entram em suas fases. Configurações é área restrita ao admin, ainda sem mutações. Timezone do hotel segue imutável.

## Fronteira de servidor

`requirePermission` valida identidade com Auth getUser e busca perfil próprio sujeito a RLS; executa can central. Todas as páginas do grupo portal fazem o guard antes do conteúdo; layout também obtém perfil para o shell. Não confiar apenas em layout/proxy porque Next reutiliza layouts nas navegações. Toda operação futura exige autorização no ponto de carga/mutação e policy/RPC correspondente. Sem ENV, somente páginas de preparação podem ser públicas; `requirePermission` nunca libera operações sem configuração.

Proxy renova com getClaims, atualiza request/response cookies e propaga cache headers do SSR. Todas as respostas configuradas recebem private/no-store, Pragma e Expires. Server client por requisição, fetch no-store, leitura nos Server Components; escrita explícita apenas nas Server Actions. Login/logout não aceitam destino de redirect externo. Server Actions POST usam proteção Origin/Host do Next; nenhum segredo privilegiado no runtime.

Login usa e-mail/senha individual, validação Zod server, mensagens genéricas e estados acessíveis. Conta Auth sem perfil ativo não entra e sua sessão recém-criada é encerrada. Logout encerra a sessão do dispositivo atual. Erro de logout não é apresentado como sucesso. Nenhum cadastro/convite/reset de senha/email real nesta fase.

## Verificação e limites

Configuração local: `auth.enable_signup=false` bloqueia registro público; `auth.email.enable_signup=true` mantém o provedor de e-mail/senha disponível. Apesar do nome, na CLI 2.119.0 o segundo campo vira `GOTRUE_EXTERNAL_EMAIL_ENABLED`, enquanto o primeiro controla `GOTRUE_DISABLE_SIGNUP`. [Fonte oficial da CLI fixada](https://github.com/supabase/cli/blob/v2.119.0/apps/cli/src/commands/start/services/gotrue.service.ts). O script de CI verifica login/perfil por HTTP antes dos testes de navegador e exige `signup_disabled` para tentativa de cadastro público.

Unit prova matriz e validação. pgTAP transacional prova grants, roles/permissões, perfil próprio, metadata não autoritativa, inativo/sem vínculo, sessão de outro usuário, revogação com claims persistentes e not_after. HTTP real prova RLS; E2E Auth prova login/logout/reload, senha incorreta, roles, inativo/sem vínculo, renovação de cookies/cache privado e navegação após revogação. Fixtures são contas fictícias criadas somente em loopback; chave admin local é mantida em memória do script, nunca enviada ao Next/browser. JSON de credenciais fictícias fica em work ignorado, e o stack é encerrado no finally do CI.

Windows sem Docker: valida apenas UI de preparação, unit e build. Hosted e equipe real exigem projeto próprio, backups/custo aprovados e provisionamento individual antes de deploy. Tipos de banco continuam contrato manual, com verificação SQL real; gerar do schema hospedado quando disponível.

Fontes consultadas: [SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [sessões e revogação](https://supabase.com/docs/guides/auth/sessions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e docs Next 16.3.8 incluídas em node_modules. Changelog consultado na Fase 3 no mesmo dia; versões Supabase continuam fixadas.
