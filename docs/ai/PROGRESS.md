# Progresso — Portal Valle

Current phase: Fase 9 — Programação semanal.
Status: IMPLEMENTED_PENDING_CI_AND_REVIEW.
Completed: Fases 0–5, Cine Fase 6 adaptada (requisitos 7 inclusos), Pizza Fase 8, CI37158542094 PASS; fechamento22a3fe8.
In progress: projeção de occurrences Cine/Pizza, segunda-domingo no fuso do hotel, navegar/escolher semana, criar/editar/cancelar pelos fluxos existentes; duplicação atômica/idempotente para destino vazio, cópias rascunho sem inscrições/presença.
Tests: check/build locais PASS,89unit;36prévia E2E PASS nos4viewports. SQL/HTTP/Auth pendentes CI Linux isolado.
Next step: revisão independente, publicação autorizada para CI, fechamento após PASS.
Blocked by: hospedado adiado por quota; Docker ausente neste Windows. Sem alterações aos legados.
Last verified implementation commit: a5fa1caf32be3599d7af5d63ea1db7a28fc647ba, CI37158542094 PASS.
Preview: porta3100 atualizada para Fase9, build .next-check, PID em work/phase9-preview.pid; não sobrescrever build servido.
Next AI instruction: ler WEEKLY_PROGRAM_OPERATIONS/PHASE_9_REPORT. Lora adiada,12adultos planejados; Cine8adultos/4puffs; Pizza12adultos; crianças nas observações. Avanço automático autorizado pelo proprietário, revisão independente por tarefa. Agenda diária permanece Fase10.

Fase9 CI37168251847/994642e: checks/e2e PASS,196pgTAP/7HTTP e checkpoints semanal/Cine/Pizza PASS; Auth13/14, locator aguardava título repetido na lista antes do redirect. Corrigido para heading level1 sem remover assertions. Cobertura adicional de editar/cancelar cópia e reflexão na semana; faixa1900–2099 em nova migration20261004013531, não editar versão já publicada. Navegação extrema omitida, destino padrão fora da faixa fica vazio; CI da correção pendente.
