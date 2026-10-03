# Contexto do projeto

Data: 2026-10-01. Fonte dos requisitos: MASTER_REQUEST.md, fornecido pelo proprietário.

## Problema e produto

A recepção do Hotel Valle D'Incanto usa sistemas distintos e planilhas. O Portal centraliza a visão diária/semanal e passa a gerir experiências próprias gradualmente, preservando os sistemas especializados.

**Portal Valle** é o nome curto de **Valle D'Incanto — Portal de Experiências**. Público inicial: recepção; perfis previstos recepcao, gerencia e admin. Desktop e tablets de 768/1024px têm prioridade, com acesso por teclado e alvos de toque preferencialmente ≥44px.

## Sistemas e propriedade

- Piscina/Academia: `luisdienstmanntd/Reservas-Piscina-Academia`; suas reservas e regras permanecem externas.
- Osteria Di Lucca: `luisdienstmanntd/Gerenciador-de-Reservas`; https://osteriadilucca.web.app/; reservas, clientes, salão, mesas, cronômetros, bloqueios e room service permanecem externos.
- Portal: `luisdienstmanntd/Portal-Valle`; repositório próprio confirmado na conta do proprietário em 2026-10-01. Projeto Vercel, Supabase e URL de produção ainda não provisionados.

Independência é requisito: indisponibilidade ou remoção do Portal não pode impedir os sistemas existentes de funcionar. Primeiras integrações são leitura, sem duplicação permanente de dados de hóspedes externos.

## Experiências

- Lora del Vino: degustação, mesa compartilhada, participantes e capacidade por pessoas.
- Cine Toscana: filme/local, grupos, capacidade por unidade ou reserva a confirmar operacionalmente.
- La Vera Pizza: sessão gastronômica na taverna, participantes e observações.
- Novas experiências usam configuração de domínio, sem condicionais por nome espalhadas e sem motor universal de eventos.

## Glossário

Experience é o conceito da experiência; occurrence é sua realização datada; booking é inscrição de um grupo; capacity é um limite com unidade explícita. Weekly Program é a projeção semanal das occurrences, não uma cópia. Stay será o conceito agregador futuro de estadia, sem presumir PMS. Provider entrega entradas normalizadas da agenda. Fonte de verdade é o sistema proprietário do dado.

## Limites da Fase 0

Auditoria estática dos repositórios e consulta de catálogos PostgreSQL; nenhum registro de hóspede/reserva consultado, nenhuma feature, migration, login nos sistemas operacionais ou deploy realizado. As fontes e limites de confirmação estão nos relatórios de auditoria. A próxima IA deve respeitar o bloqueio de fase de PROGRESS.md.


## Regras confirmadas em 2026-10-03

Cine Toscana: 8 vagas de adultos e 4 puffs de casal, distribuição exclusiva provisória ceil(adults/2). Pizza e Lora: capacidade inicial de 12 adultos. Crianças entram somente nas observações, com idade (ex.: 2 adultos; CHD 2 anos), sem contagem de vagas. Isso substitui a interpretação anterior de proibição de crianças. Lora segue adiada pelo proprietário. Fase 8 reutiliza o fluxo de experiência para Pizza, sem financeiro.
