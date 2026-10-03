# Fase 6 adaptada — Cine Toscana

## Objetivo

Primeiro fluxo operacional de Experience no Cine, por escolha expressa do proprietário. Lora permanece adiada; não declarar o requisito original Lora implementado.

## Implementado

Criar/editar/cancelar sessão com filme/local/horário; reservar/editar/cancelar/reativar inscrição; capacidade8adultos/4puffs, presença independente e notas. Somente adultos. Responsável registrado pelo login criador. Puffs exclusivos provisoriamente ceil(adults/2), enquanto resposta opcional sobre compartilhamento está pendente. Autorização individual, locks por sessão, versões, idempotência e auditoria transacional.

## Arquivos criados

Rotas/formulários/actions em src/app/(portal)/experiencias/cine-toscana; lib/hotel-time; domínio commands/testes; infrastructure/cinema; migration20261003204322; portal_cinema.test.sql; scripts/test-cinema.mjs; cinema-preview.spec.ts; CINEMA_OPERATIONS e este relatório.

## Arquivos alterados

Experiências/globals.css, tipos database/model/fixtures/mapping, permissions, test-auth/login.spec, isolamento do teste SQL anterior e docs de continuidade/ADR010.

## Banco

Catálogo Cine sem dados pessoais; configuração pessoas por unidade/crianças, versões/responsável, receipts privados sem payload, RPCs estreitas authenticated e trigger configuração. Sem DML client direto/credencial privilegiada operacional. Hosted adiado; nenhuma alteração aos legados.

## Testes executados

Locais: lint, TypeScript,83unit, build separado,28E2E públicos em4viewports e capturas. HTTPprévia200 e deep link semENV404. SQL/Auth/concorrência em CI37155203841 no commitdb28d2b; execução final PASS.

## Resultado dos testes

Locais PASS. Primeira tentativa E2E falhou por Chromium ausente da versão atual; browser correto instalado somente work ignorado, execução posterior28PASS. CI37154422828: checks/e2ePASS,140pgTAP/7HTTP/advisors/concorrênciaRPC PASS; AuthUI12/14PASS e2falhas por locator ambíguo de reativação (summary/botão). Correção348d8fb seleciona summary; CI37154772166 repetiu12/14 por timeout do botão após clicksummary; provável preservação de details aberto. Teste agora abre somente se botão não estiver visível. CI37155203841 no commitdb28d2b: checks/e2e/database PASS;83unit/28preview/140pgTAP/7HTTP/14AuthE2E, checkpointsRPC/advisors/cleanup PASS. APROVADO TECNICAMENTE pelo revisor independente após conferir CI/logs/implementação/documentação.

## Riscos encontrados

Revisão detectou cancelamento repetido gerando versões sem alteração: corrigido E_CANCELLED. RPC booking agora exige categoria cinema. Prévia semENV não grava e não tem contas reais.

## Pendências

Hosted/quota/contas reais/retenção. Confirmar distribuição de puffs se compartilhamento for necessário. Lora/no_show/transferências fora do fluxo atual. Safari/Firefox/tablet físico não verificados.

## Commit

Implementação56143a4b07b17b4e9b1f200c73688cde783eb9d5, publicada no Portal-Valle autorizado. Correções de teste348d8fbbe1fd75572abb378e5b12c2e4a981339f e db28d2b85aee20d6859b4fb87e6b2e6ddc47ab67. Fechamento documental publicado após aprovação independente; código validado no commitdb28d2b.

## Próxima fase

Após conclusão desta etapa, propor próxima frente ao proprietário. Não considerar Lora concluída nem avançar para Pizza sem autorização.

## Validação manual sugerida

Prévia http://127.0.0.1:3100/experiencias/cine-toscana aberta: verificar regras/filme/local/horários/responsividade. Operações reais somente no CI isolado até conectar Supabase próprio.

AGUARDANDO AUTORIZAÇÃO PARA INICIAR A PRÓXIMA FASE.
