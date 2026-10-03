# Identidade visual encontrada

Fonte: [Piscina/Academia no commit eeecd6d](https://github.com/luisdienstmanntd/Reservas-Piscina-Academia/tree/eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0), principalmente `src/app/globals.css`, `src/app/layout.tsx`, componentes `ui/button.tsx`, `ui/card.tsx` e telas de recepção. Transposição implementada na Fase 2; detalhes/fontes/licenças em [DESIGN_SYSTEM](DESIGN_SYSTEM.md).

## Cores e tipos reais

- Fundo `#f9f7f2` (creme), surface/card `#ffffff`, texto `#2d2926` (carvão).
- Primário `#604d3f` (castanho), texto do primário `#f9f7f2`.
- Header/acento `#d1d8df`; slot disponível `#8da4b7`; ocupado `#d6d3d1`.
- Muted `#ebe8e4`, borda/input `#ddd8d2`, foco `#604d3f`; raio base `0.625rem`.
- Inter para interface e Playfair Display para títulos. Importar fontes de modo próprio no Portal, sem runtime entre repositórios.

Paleta é observação do código, não guia de marca formal aprovado. Verificar contraste em texto pequeno/estados antes de portar tokens. O Portal deve usar a mesma linguagem de botões, inputs, cards e tipografia, com baixa poluição visual e prioridade para leitura rápida da recepção.

## Logo e assets

- `public/logo-valle-dincanto.jpg`, 1024×364, castanho em fundo claro: **logo efetivamente usado** nas telas auditadas. [Origem fixa](https://github.com/luisdienstmanntd/Reservas-Piscina-Academia/blob/eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0/public/logo-valle-dincanto.jpg).
- `public/brand/logo-header.png`, 354×140, castanho de fundo e texto claro: alternativa encontrada. [Origem fixa](https://github.com/luisdienstmanntd/Reservas-Piscina-Academia/blob/eeecd6db4f2a327aafa47759a3e66a2c5a7fc5e0/public/brand/logo-header.png).
- `public/brand/logo-valle-dincanto.png` e `public/brand/logo-valle-top.png` têm o mesmo blob no snapshot analisado; confirmar uso antes de escolher.

Na Fase 1, o JPG usado no sistema de referência foi copiado para `public/brand/logo-valle-dincanto.jpg` no Portal, sem hotlink. SHA-256 de origem e cópia: `8e3abee264752f6f6255288b97be5b494a0f0223757d11872f57346a0c65d01c`. Origem e uso estão documentados acima; licença/brand ownership devem ser confirmados pelo proprietário antes de redistribuição fora do projeto do hotel.

## Interface alvo

Sidebar e cabeçalho discretos, card Hoje com linha de tempo legível, estados de fonte indisponível específicos, tabela operacional sem gráficos decorativos. Desktop/tablet 768 e 1024 px, portrait/landscape, teclado/foco visível e alvos de toque ≥44 px. Páginas sem funcionalidade podem mostrar empty state, sem prometer ação inexistente.
