# Design system — Portal Valle

Implementado na Fase 2, em 2026-10-02. A paleta e a tipografia partem de [VISUAL_IDENTITY](VISUAL_IDENTITY.md), levantada no sistema Piscina/Academia. Código e assets do Portal são independentes.

## Tokens e tipografia

`src/app/globals.css` centraliza superfícies creme/branco, castanho primário, texto/muted/bordas, foco, raio e cores semânticas success/warning/danger. Estilos usam tokens para cores. Inter atende a interface; Playfair Display atende a títulos. `next/font/local` serve as fontes pelo próprio Portal, sem fetch de fonte na compilação ou no navegador.

Contraste calculado em seis pares texto/superfície: muted/creme 5,37:1, muted/muted 4,70:1, creme/primário 7,46:1 e estados success/warning/danger 6,64:1, 6,33:1 e 6,11:1. Não substitui avaliação completa WCAG de futuros formulários e dados.

Arquivos em `public/fonts`, obtidos sem modificação do [google/fonts no commit 9710da1](https://github.com/google/fonts/tree/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl), em 2026-10-02:

- Inter, `ofl/inter/Inter[opsz,wght].ttf` → `inter-variable.ttf`; SHA-256 `29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031`. Licença integral `inter-OFL.txt`.
- Playfair Display, `ofl/playfairdisplay/PlayfairDisplay[wght].ttf` → `playfair-display-variable.ttf`; SHA-256 `c40f2293766a503bc70cce9e512ef844a4ccb7cbcde792fe2ea31d191917d8d6`. Licença integral `playfair-display-OFL.txt`.

Ambas estão sob SIL OFL 1.1. O logo existente permanece local, com origem em VISUAL_IDENTITY.

## Componentes

`src/components/ui/primitives.tsx`: Button (primary/secondary/danger; `type=button` por padrão), Card, Badge (tons semânticos), Label, Input, Textarea, Select e Table. Controles encaminham props nativas; quem implementa um formulário associa `htmlFor`/`id`, descrição/erro e `aria-invalid`. Table exige caption e permite rolagem horizontal por teclado. `buttonClass` aplica a linguagem visual a links sem trocar sua semântica.

`dialog.tsx`: Dialog e AlertDialog sobre `<dialog>.showModal()`. Título e descrição têm IDs próprios, fundo fica modal, foco começa em Fechar/Cancelar, Esc fecha e devolve o foco à origem. `dialog-focus.ts` mantém Tab/Shift+Tab entre os controles visíveis e habilitados. AlertDialog exige callback explícito de confirmação; nenhuma operação do produto usa confirmação nesta fase.

`states.tsx`: EmptyState e ErrorState, com descrição e ação opcional; erros têm role alert. `icon.tsx` contém SVGs próprios e decorativos. Não há componente genérico de negócio.

## Navegação e estados

Shell: `src/components/shell`. Sidebar a partir de 768px; menu modal abaixo disso. Links de pelo menos 44px, `aria-current`, link de salto para main, foco visível. Menu fecha após navegação e por Esc. Layout/páginas são server; client restrito à navegação ativa e aos diálogos.

Rotas: `/hoje`, `/agenda`, `/programacao`, `/experiencias`, `/piscina`, `/academia`, `/osteria`, `/configuracoes`; `/` redireciona para Hoje. Todas mostram informações de preparação. Hóspedes/Relatórios ainda não existem e não são apresentados no menu. Nenhuma contagem de reserva ou falsa sincronização é exibida. 404 tem retorno para Hoje.

## Validação

`tests/e2e/shell.spec.ts` verifica navegação, foco, Esc, retorno, link de salto, 404, targets, overflow, ausência de erros JS e requisições externas em Hoje. Viewports 1440×1000, 768×1024, 1024×768 e 390×844 em Chromium. Capturas reais foram inspecionadas. Tablet físico e outras engines permanecem pendentes; novos formulários exigem seus próprios testes.
