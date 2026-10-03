# FASE 2 — Design system e shell

## Objetivo

Criar a estrutura visual e a navegação do Portal com a identidade observada no sistema Piscina/Academia, conforme autorização para continuar após a Fase 1.

## Implementado

- Layout/header/sidebar, navegação mobile modal e oito rotas previstas; `/` redireciona para `/hoje`.
- Hoje com links de navegação e tabela das áreas em preparação; demais áreas com estados claros de preparação, sem inventar disponibilidade ou reservas.
- Componentes Button/Card/Badge/Input/Label/Textarea/Select/Table/Dialog/AlertDialog/EmptyState/ErrorState; tokens centrais, fontes locais e licenças.
- Teclado, foco visível, skip-link, aria-current, modal com Tab/Shift+Tab/Esc e retorno de foco; 404 com retorno.

## Arquivos criados e alterados

Criados: `.gitattributes` (licenças originais/fontes binárias), `src/components/{ui,shell}`, `src/app/{hoje,agenda,programacao,experiencias,piscina,academia,osteria,configuracoes}/page.tsx`, `src/app/not-found.tsx`, `public/fonts/*`, `tests/e2e/shell.spec.ts`, `docs/architecture/DESIGN_SYSTEM.md` e este relatório.

Alterados: `src/app/{layout.tsx,page.tsx,globals.css}`, `playwright.config.ts`, CI (instalação do Chromium), README e documentos de continuidade.

## Banco

Nenhum banco, migration, credencial, Auth ou integração nesta fase. Nenhuma gravação operacional.

## Testes e resultados

- `npm run check`: PASS — lint, TypeScript strict e 3 unitários.
- `npm run build`: PASS — oito rotas, redirect e 404 compilados.
- `npm run test:e2e`: PASS — 20 testes em Chromium: desktop 1440×1000, tablet portrait 768×1024, tablet landscape 1024×768 e mobile 390×844.
- Primeira execução mostrou saída do foco dos controles modais com Tab; ciclo explícito corrigido e suíte completa repetida com sucesso.
- Capturas reais desktop/tablets/mobile inspecionadas; sem overflow na página Hoje, navegação ≥44px, sem pageerror nem requisições externas nessa página.
- Contraste calculado em seis pares de tokens usados para texto/estados: de 4,70:1 a 7,46:1. Verificação focal, não auditoria completa WCAG.
- [CI remoto 37086206304](https://github.com/luisdienstmanntd/Portal-Valle/actions/runs/37086206304): PASS — jobs `checks` e `e2e`, incluindo `npm ci`, build e os 20 testes de navegador no Ubuntu.

## Riscos e pendências

Validação em tablet físico/Safari/Firefox não realizada. No Windows, usar servidor pré-iniciado para o E2E, conforme KNOWN_ISSUES. Input/Select/Textarea/AlertDialog estão preparados, mas os futuros fluxos de negócio ainda não existem e exigirão testes próprios. Riscos anteriores de integração permanecem.

## Commit e revisão

Subagente revisor: **APROVADO TECNICAMENTE**. Repetiu check e 20 E2E com sucesso e conferiu fontes/licenças/capturas/contrastes; build final concluído com sucesso pelo agente principal. Implementação publicada no commit [`d34ed631299425636814ae38a7f0f9965d966b94`](https://github.com/luisdienstmanntd/Portal-Valle/commit/d34ed631299425636814ae38a7f0f9965d966b94). Fontes, licenças e origem em DESIGN_SYSTEM.md.

## Próxima fase

Fase 3: projeto/banco exclusivo do Portal. Iniciar somente após autorização separada do proprietário.

## Validação manual sugerida

`npm ci`, `npx playwright install chromium`, `npm run build`, `npm run start`; conferir `/hoje`, abrir as áreas no menu, usar Tab/Shift+Tab/Esc em Ajuda de navegação, verificar tablet 768/1024 e celular. Nunca usar o shell como evidência de reservas reais.

Prévia local mantida aberta a pedido do proprietário em `http://127.0.0.1:3100/hoje`; é temporária e depende do processo local ativo. Capturas desktop/tablet/mobile em `outputs/fase2-hoje-*.png` no workspace.

**AGUARDANDO AUTORIZAÇÃO PARA INICIAR A PRÓXIMA FASE.**
