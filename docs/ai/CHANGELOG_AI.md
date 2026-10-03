# Changelog de trabalho IA

## 2026-10-03 — Cine operacional em validação

- Fase6 reordenada pelo proprietário: Cine primeiro, Lora adiada. Somente adultos8pessoas/4puffs; puffs exclusivos provisoriamente.
- UI sessão/filme/local/inscrição/presença/notas, bookings.manage e RPCs locks/idempotência/versões/auditoria; SQL bloqueia crianças/unidades falsas. Hosted desconectado.
- Check83unit, build separado e28E2E públicos PASS; SQL/concorrência/Auth em validação. Cancelamento repetido corrigido após achado do revisor; conclusão pendente.
- CI37154422828:140pgTAP/7HTTP/concorrênciaRPC PASS; AuthUI12/14PASS, reativação falhou por locator textual ambíguo summary/botão. Teste corrigido para selecionar summary; nova execução pendente.
- CI37154772166: banco/HTTP/RPC novamente PASS, AuthUI12/14PASS; timeout após clicksummary; provável preservação de details aberto. Corrigir teste para abrir somente se botão não estiver visível; manter assertions de capacidade/presença/reativação.

## 2026-10-03 — Modelo de experiências validado

- Fase5 autorizada automaticamente após fechamento técnico da Fase4; proprietário informou Cine8pessoas/4puffs e pediu adiar regraLora.
- Quatro tabelas Portal, domínio puro/validação, projeção de capacidade por unidade/limite físico, RLS/sessão viva e auditoria com allowlist/actor na mesma transação. Escritas client fechadas até RPCs atômicas Fase6. Sem UI operacional, seed real ou alteração de legados.
- Check67unit e build separado PASS; mapper explícito valida linhas do banco e remove timestamps antes do DTO puro. CI37151730319 PASS: 113pgTAP/7HTTP/14AuthE2E/24preview/advisors/cleanup; APROVADO TECNICAMENTE pelo revisor independente; tipos manuais atualizados. Implementação3803dd111e0e7a5f7da1e87d1b07e6abea5f182e. Sem autorização automática para Fase6.

## 2026-10-02 — Auth/RBAC validado

- Fase4 autorizada; Fase5 autorizada automaticamente após conclusão técnica da Fase4.
- Login/logout individuais, perfil ativo e sessão viva, RLS/private lookup, matriz central, proxy/cookies/no-store e guards de página. Nenhum legado alterado; hosted adiado.
- Check41unit/build/24E2E preview PASS. CI 37090654113 PASS: 63 pgTAP, 3 HTTP, 14 Auth E2E, advisors e cleanup. Implementação 4bb94a3; correção bf01c925897ab07132c8d6b0ff09ce57bf1067ca. APROVADO TECNICAMENTE pelo revisor independente.
- CI inicial revelou email_provider_disabled: auth.email.enable_signup habilita o provedor de e-mail na CLI, enquanto auth.enable_signup=false bloqueia registro público. Correção confirmada com checkpoints Auth/perfil e signup_disabled. Nenhum cookie, chave ou dado pessoal registrado.



## 2026-10-02 — Base Supabase do Portal concluída em CI

- Fase 3 autorizada; banco hospedado adiado pelo proprietário após quota gratuita impedir criação.
- Migration portal_settings, RLS/grants/default deny, clientes tipados browser/server de leitura, identidade ENV e bloqueio de segredos/legados, testes pgTAP/HTTP e job CI isolado.
- Supabase JS 2.117.2, SSR 0.12.7 e CLI 2.119.0 fixados. Nenhum banco/repositório legado alterado; nenhuma Auth/experiência operacional.
- Check local PASS com 16 unit; build separado PASS. CI 37087962869 PASS (checks/e2e/database): 22 pgTAP e 3 HTTP reais, cleanup PASS. Implementação c1d2b6f. APROVADO TECNICAMENTE pelo revisor independente. Prévia permanece aberta na porta 3100.


## 2026-10-02 — Design system e shell

- Solicitação: continuar após a Fase 1; proprietário também pediu navegador aberto para acompanhar a interface.
- Fase: 2.
- Arquivos: `src/components/{ui,shell}`, oito páginas, layout/CSS/redirect/404, fontes/licenças em `public/fonts`, E2E/config/CI, README e docs.
- Motivo: criar navegação e identidade consistentes para os próximos fluxos.
- Impacto: shell navegável com estados de preparação; nenhum dado real, Auth, banco, integração ou mutação operacional. Prévia local aberta em `http://127.0.0.1:3100/hoje`.
- Testes: `npm run check` PASS (lint, TypeScript, 3 unit); build PASS; 20 E2E Chromium PASS nos 4 viewports após correção do ciclo Tab nos diálogos. Capturas inspecionadas.
- Revisão: APROVADO TECNICAMENTE; revisor repetiu check e os 20 E2E com sucesso. Commit publicado: `d34ed631299425636814ae38a7f0f9965d966b94`. [CI 37086206304](https://github.com/luisdienstmanntd/Portal-Valle/actions/runs/37086206304) PASS nos jobs checks/e2e.

## 2026-10-01 — Fundação independente

- Solicitação: proprietário autorizou prosseguir para a Fase 1 e publicar a documentação da Fase 0 no GitHub público. Também pediu subagente revisor para cada tarefa concluída.
- Fase: 1.
- Arquivos: `package.json`/lockfile, `.nvmrc`, configs Next/TS/Tailwind/ESLint/Vitest/Playwright, `.github/workflows/ci.yml`, `.env.example`, `src/app`, `src/lib/env.server.*`, `tests/e2e`, `public/brand/logo-valle-dincanto.jpg`, `.cursor/agents/portal-reviewer.md`, README/AGENTS/docs de continuidade.
- Motivo: criar base testável sem antecipar features ou integrações; tornar revisão técnica repetível.
- Impacto: página `/` de preparação, sem dados reais nem acesso externo. Sistemas legados não alterados. Nenhum Supabase/Vercel do Portal criado.
- Testes: `npm run check` PASS (lint, TypeScript, 3 unit); `npm run build` PASS; Playwright HTTP smoke 1 PASS com servidor pré-iniciado. Execução automática do webServer no Windows deixou o processo preso após o teste e foi registrada em KNOWN_ISSUES. GitHub Actions [execução 36955589105](https://github.com/luisdienstmanntd/Portal-Valle/actions/runs/36955589105) PASS nos jobs `checks` e `e2e`, com `npm ci` em ambos.
- Commit de implementação aprovado tecnicamente e publicado: `44d925b49f3cfecd7072aa45934f0305e7360fdd`.

## 2026-10-01 — Publicação autorizada da Fase 0

- Solicitação: publicar documentação detalhada no repositório público.
- Fase: 0 (material documental já concluído).
- Arquivos: documentação inicial em `docs/ai/` e `docs/architecture/`, README e AGENTS.
- Motivo: o proprietário autorizou expressamente a exposição do conteúdo auditado depois da rejeição automática inicial. Revisor independente aprovou tecnicamente, destacando o risco de tornar públicos achados de segurança do legado.
- Impacto: documentação pública no novo repositório; nenhum sistema externo alterado.
- Testes: conferência de árvore remota e leitura do relatório publicado.
- Commit remoto: `4c93904b74270332deee9b4e91038c2a5c6e860b`.

## 2026-10-01 — Descoberta do Portal Valle

- Solicitação: executar exclusivamente Fase 0 do pedido mestre.
- Fase: 0.
- Arquivos: `README.md`, `AGENTS.md`, documentação em `docs/ai/` e `docs/architecture/`.
- Motivo: registrar fronteiras, evidências, stack e decisões para manutenção por pessoas e IAs.
- Impacto: documentação completa criada localmente. O proprietário autorizou sua publicação no GitHub público antes da Fase 1. Repositórios/bancos externos não modificados; nenhuma aplicação/deploy criada na Fase 0.
- Testes: não aplicáveis a código; leitura GitHub e catálogos SQL read-only; verificação estrutural/segredos documentada no relatório.
- Commit: `a607c53` local inicial; `1b95b835b081af1ef418aff15379b62350bc950b` remoto de README. O fechamento local terá commit posterior; obter SHA com `git log -1`.
- Publicação detalhada: rejeitada inicialmente pela revisão automática por risco de exposição de material interno em repositório público. O proprietário autorizou expressamente essa publicação na mensagem seguinte.

Fase6 adaptada: CI37155203841/db28d2b PASS completo (83unit/28preview/140pgTAP/7HTTP/14AuthE2E/checkpointsRPC/advisors/cleanup). APROVADO TECNICAMENTE após revisão independente dos logs/CI e implementação. Fase6 adaptada encerrada; Lora e hosted continuam adiados.

## 2026-10-03 — Fase 8 La Vera Pizza

Proprietário autorizou prosseguir, adiou Lora e confirmou capacidade inicial 12 adultos para Pizza/Lora; crianças nas observações com idade em Cine/Lora/Pizza. Reutilização de consultas/UI/ações e operações transacionais de Cine/Pizza, RPCs restritas ao catálogo, idempotência por operação e unidades zero em persons. Sem financeiro e sem mutações dos legados. Check/build local PASS, 85 unit e 32 prévias E2E PASS; CI isolado e revisão final pendentes. Prévia na porta 3100 preservada.
