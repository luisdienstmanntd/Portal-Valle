# Fase 5 — Modelo experience

Status: implementação em validação. Autorizada automaticamente pelo proprietário após conclusão técnica da Fase 4.

## Entrega

Schema das quatro tabelas próprias, constraints/FKs/índices, RLS de leitura com sessão viva, domínio puro validado, projeção de capacidade por unidade e limite físico, auditoria na mesma transação com payload mínimo. Sem UI completa, RPC de escrita, integração externa ou dados reais.

Arquivos: migration portal_experiences, teste pgTAP portal_experiences, model/capacity/model.test, database.types e documentação de continuidade. Cine preserva 8 pessoas/4 puffs de casal; Lora permanece pendente por escolha do proprietário.

## Verificação

Check local PASS com 67 unit (inclui 3 regressões DB Row→domínio). Build separado em .next-check PASS; CI SQL/Auth aguarda publicação de validação. Não declarar PASS do banco sem execução. Revisor independente será chamado antes da publicação de validação e para aprovação final.

## Limites

Supabase hospedado adiado; sem Docker Windows. Tipos são contrato manual. Capacidade calculada no domínio não é lock transacional: nenhuma escrita client está liberada. Concorrência, idempotência e mutações operacionais pertencem à Fase 6. Lora/crianças/no_show e retenção permanecem sem regra operacional presumida.

## Próxima fase

Fase 6 somente mediante autorização explícita do proprietário. Não iniciar automaticamente; autorização recebida cobriu esta Fase 5.
