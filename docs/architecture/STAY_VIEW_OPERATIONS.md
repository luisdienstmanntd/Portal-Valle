# Visão Estadia — Fase15

O conceito inicial é um escopo de consulta manual: apartamento e intervalo civil inclusivo, até31dias em America/Sao_Paulo. Não é cadastro/check-in, identificação de hóspede ou estadia persistida. O mesmo apartamento pode receber grupos distintos; a recepção deve conferir o vínculo no detalhe autorizado da inscrição. Nenhum PMS, matching por nome, associação automática ou alteração de stay_id.

/estadias exige experiences.read antes da consulta; sem ENV exibe somente preparação, sem ler banco. Cliente usa sessão individual/RLS, no-store e cancelamento. Consulta sessões Cine/Pizza de catálogos ativos, depois projeção id/occurrence_id/apartment_number/status das inscrições por igualdade exata de apartamento aparado, respeitando contrato existente1–30caracteres. Não seleciona nome, telefone, observações, aptos de outros grupos ou dados externos.

DTO estrito valida IDs, estado, intervalo e apartamento, exclui PII adicional. Deadline5s e abort; fonte desconhecida, vazia e indisponível são distintas. O período inclui ambas as datas; sessões pertencem ao dia inicial. Cancelamentos, no_show, rascunhos e concluídas são explicitados e preservados. Cada inscrição permanece uma entrada, incluindo múltiplas inscrições na mesma sessão. Links levam ao detalhe autorizado.

Limites: consulta completa requer até100sessões no período antes de filtrar o apartamento, e até100inscrições para o apartamento.101 detecta excesso e falha integralmente, sem lista truncada. Comparação de apartamento é exata (sem colapsar zeros, letras, pontuação ou caixa); não constitui identidade da estadia. Catálogos inativos não são consultados; UI descreve essa abrangência.

Piscina, Academia e Osteria permanecem sem vínculo seguro de estadia; factories continuam null. DTO diário sem apartamento não permite correlação. Lora adiada. UI mostra visão parcial e orienta consulta das fontes; não apresenta ausência nem dados fictícios como reais. Conectar essas fontes requer acesso SELECT-only e contrato mínimo especificamente autorizado, sem ampliar DTOs compartilhados só para esta tela.

Nenhuma migration/tabela/API externa/dependência nova ou escrita operacional. Dados sintéticos no CI exercitam consulta real de Cine/Pizza e retorno ao detalhe; previews sem ENV nos quatro viewports, validação/timeout/PII em testes de aplicação. Produção hospedada e tablet físico continuam pendentes.
