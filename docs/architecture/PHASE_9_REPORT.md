# Fase 9 — Programação semanal

## Objetivo

Visual semanal/criação/edição/cancelamento/duplicação sem reservas.

## Implementado

Projeção real Cine/Pizza, seleção/navegação segunda-domingo, links para fluxos existentes e revalidação; cópia atômica/idempotente em rascunho para destino vazio.

## Arquivos criados/alterados

weekly-program/domain/ui, programacao/page/actions, experiences/queries/actions, CSS, tipos RPC, migration20261004011842, SQL/HTTP/unit/E2E e docs.

## Banco

RPC weekly_program.manage, array de resultados privado, serialização comum de occurrence e duplicação, clone sembookings/draft/version1/responsávelatual. Sem tabela duplicada de programação, sem alteração aos legados.

## Testes executados

Check89unit/buildPASS local; 36 prévias E2E PASS nos4viewports; capturas desktop/mobile inspecionadas. SQL/HTTP/Auth pendentes CI isolado Linux.

## Resultado dos testes

Local PASS; aguardando CI/revisão.

## Riscos encontrados

Hosted/quota/contasreais/retenção/tablet físico pendentes. Destino inclusivecancelados bloqueia, máximo100sessões. SQLprivilegiado fora de garantia operacional.

## Pendências

Concluir CI/revisor; Lora segue adiada.

## Commit

A registrar após revisão.

## Próxima fase

Fase10 Agenda diária, avanço automático autorizado pelo proprietário.

## Validação manual sugerida

Abrir /programacao, escolher semana/avançar/voltar; com Authisolado criar/editar/cancelar nos links de sessão e conferir reflexão na semana; duplicar em destino vazio, publicar rascunhos após conferência, verificar ausência de inscrições/presença.

Fase9 CI37168251847/994642e: checks/e2e PASS,196pgTAP/7HTTP e checkpoints semanal/Cine/Pizza PASS; Auth13/14, locator aguardava título repetido na lista antes do redirect. Corrigido para heading level1 sem remover assertions. Cobertura adicional de editar/cancelar cópia e reflexão na semana; faixa1900–2099 em nova migration20261004013531, não editar versão já publicada. Navegação extrema omitida, destino padrão fora da faixa fica vazio; CI da correção pendente.
