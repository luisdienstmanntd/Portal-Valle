# Cine Toscana — primeiro fluxo operacional

Fase 6 adaptada: proprietário adiou Lora e escolheu expressamente Cine Toscana em 2026-10-03. O requisito original permanece em MASTER_REQUEST; a reordenação não declara Lora implementada.

Regra corrigida pelo proprietário na Fase 8: 8 vagas de adultos e 4 puffs de casal. Crianças são registradas nas observações, com idade, sem vagas ou quantidade estruturada; children=0 é técnico e não impede participação. Por enquanto cada inscrição usa puffs exclusivos: `ceil(adults / 2)`. Compartilhamento entre inscrições aguarda resposta opcional; esta suposição foi comunicada. Limites por sessão podem ser reduzidos respeitando ocupação; zero fecha vagas.

Sessões têm filme/local/início/fim/disponibilidade e responsável pelo login criador. Reservas têm apartamento/nome/adultos/observações/status/presença independentes. Contas individuais ativas: gerência/admin gerem sessões; recepção/gerência/admin gerem inscrições. Não há DML client direta.

Server Actions verificam sessão/permissão e Zod estrito. RPCs usam sessão pública do operador e verificam perfil atual/sessão viva novamente. Locks: catálogo → sessão → inscrição. Reserva/edição/reativação/redução verificam ambos os limites sob o mesmo lock. Transferências recusadas nesta versão. Cancelar sessão cancela inscrições na mesma transação, preservando presença/histórico. Cancelamento repetido com nova chave retorna E_CANCELLED sem alterar versão; mesma chave devolve resultado anterior.

Versão impede sobrescrita de edição concorrente. Request escopado ao actor, serializado por advisory lock, guarda hash SHA256 sem payload pessoal. Payload divergente na mesma chave falha. Escrita/receipt/auditoria transacionais; falha da auditoria desfaz tudo. Allowlist exclui texto livre; logs/UI não expõem SQL/payloads.

`no_show` existente bloqueia novas escritas de capacidade até política definida. Presença ausente não altera automaticamente status de inscrição. Datas convertidas explicitamente em America/Sao_Paulo. Sem inscrição pública/dados reais/escrita nos legados. SQL administrativo privilegiado pode alterar capacidade diretamente; RPCs são único caminho operacional suportado.

Testes: commands.test.ts (crianças/unidades/fuso/erros), portal_cinema.test.sql (grants/Auth/configuração/idempotência/versões/rollback), test-cinema.mjs (HTTP/última vaga/redução concorrente), login.spec.ts (sessão/reserva/presença/cancelamento/reativação/papéis). Banco/Auth somente CI loopback efêmero. Prévia sem ENV exibe formulários desabilitados, sem simular inscrições.

Pendências: Supabase hospedado, retenção/contas reais e eventual confirmação/alteração da distribuição de puffs.

