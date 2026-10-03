# Fase 4 — Auth/RBAC

Status: implementação liberada para validação em CI; aprovação final pendente. O proprietário autorizou iniciar a Fase 5 automaticamente depois do encerramento técnico desta fase, em 2026-10-02.

## Objetivo

Autenticação própria do Portal e autorização por recepção, gerência e administração.

## Implementado

Login/logout server, sessão SSR/proxy/cookies sem cache compartilhado, perfil ativo no banco, matriz can central e equivalente SQL, RLS com sessão viva, páginas protegidas e navegação por permissão. Preview sem ENV mantém preparação e login desabilitado, sem autenticação falsa.

## Arquivos criados

Migration portal_auth, pgTAP, módulos auth domain/session, login/acesso-negado, proxy, layout do grupo portal, script/config/E2E Auth, teste de login de preparação e documentação AUTH_AND_RBAC.

## Arquivos alterados

Oito páginas movidas ao grupo portal sem mudar URLs; root layout/shell/nav/CSS; server client/tipos; package/CI e continuidade.

## Banco

portal_profiles com FK Auth, enum role e active; private.has_permission restrita à identidade/sessão; policy staff de leitura de settings. Sem escrita operacional/settings ou recursos legados. Supabase hosted continua adiado por quota.

## Testes executados

Check local PASS (lint/TS/41 unit), build PASS, 24 E2E da prévia PASS nos quatro viewports. PostgreSQL/Auth reais aguardam CI porque Docker não está instalado no Windows.

## Resultado dos testes

CI de banco/Auth pendente. Não declarar fase concluída até PG/HTTP/Auth E2E e revisão final.

## Riscos encontrados

Sem hosted/equipe real; CI não comprova recuperação/backup SaaS. Tipos manuais. Dispositivos físicos/Safari ainda não testados.

## Pendências

Verificar CI e obter aprovação final. Hosted antes de uso real, com custo/backup/provisionamento individual aprovados.

## Commit

Obter SHA de implementação após publicação de validação.

## Próxima fase

Fase 5 — modelo experience, autorizada automaticamente pelo proprietário após conclusão técnica da Fase 4. Não iniciar antes de fechar testes/revisão desta fase.

## Validação manual sugerida

Prévia preservada em http://127.0.0.1:3100/hoje; botão Entrar mostra login em preparação. Nenhuma conta real conectada nesta máquina. Fluxo real é demonstrado pelos testes CI isolados.
