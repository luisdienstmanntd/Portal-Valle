# Home Hoje — composição das fontes

A Home usa data/dia da semana de America/Sao_Paulo. readHomeDay compõe em paralelo a agenda de sessões Cine/Pizza e os contratos diários de Piscina, Academia e Osteria. Cada leitor já isola timeout/abort/payload e retorna erro sanitizado; falha operacional de uma fonte não interrompe as demais. Sem persistência, SDK, migration ou consulta externa adicional.

Guard portal.read precede a carga. O carregador server-only também exige experiences.read, facilities.read e osteria.read antes de construir leitores. Os três papéis atuais possuem essas permissões. Preparação sem ENV segue pública sem dados reais; quando Auth próprio estiver configurado, exige sessão/perfil ativo. Force-dynamic e clientes existentes preservam consultas sem cache compartilhado.

Quatro cards exibem unknown/unavailable/empty/available e horário de consulta/tentativa. Contagens somente após resposta válida e completa. Experiências conta sessões incluindo canceladas/concluídas, sem sugerir ocupação; inscrições permanecem no detalhe autorizado. Facilities conta horários reservados, sem inferir pessoas/disponibilidade/capacidade. Osteria mostra reservas ativas/pessoas, room service explicitamente incluído e canceladas fora dos totais. Unknown/falha nunca vira zero.

Timeline única ordenada por instante/ID; prefixo da instalação evita colisões Piscina/Academia. Sessões ficam no dia inicial e mostram fim com data quando cruza meia-noite. Osteria preserva segundos sem duração inventada. Canceladas ficam visíveis com badge explícito. Links levam ao detalhe próprio; nenhuma identidade de hóspede, apartamento, telefone, observação ou financeiro é carregada na Home. Mesas/pessoas vêm exclusivamente do DTO mínimo validado da Osteria.

Próxima atividade consultada considera início futuro, excluindo rascunhos/concluídas/canceladas. Não afirma presença/disponibilidade. Fontes unknown/unavailable exibem visão parcial mesmo quando há sessões próprias. Mensagem de dia vazio só aparece com todas as fontes consultadas e timeline vazia. Atualizar dia recarrega rota e calcula novamente data/consultas.

Factories Facilities/Osteria permanecem null incondicionalmente. Composição/fixtures não autorizam conexão operacional: acesso SELECT-only comprovado e contrato da origem verificado em ambiente autorizado continuam necessários. Nenhum legado/banco/deploy alterado. Agenda mantém contrato Fase10 somente sessões próprias; expansão desta fase é da Home.

Testes: quatro fontes, ordenação/IDs/segundos/fim noturno, nulos versus zeros, cancelamentos, próximo consultado, falha parcial Portal/Piscina, schema incompleto e timeout não cooperativo. Prévia em quatro viewports verifica cards/aviso/atualização/navegação/overflow. Auth CI verifica sessões sintéticas com três fontes externas pendentes e ausência de PII.
