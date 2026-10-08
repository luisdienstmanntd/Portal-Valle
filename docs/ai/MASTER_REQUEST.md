# Portal Valle — requisito vigente

Decisão do proprietário em 07/10/2026. Substitui o roteiro original, preservado em ../history/MASTER_REQUEST_BEFORE_RECEPTION_SCOPE.md. Não retomar fases antigas automaticamente.

Atualização confirmada pelo proprietário: inicialmente sem senha, qualquer pessoa com o endereço pode consultar nomes/apartamentos e criar, editar ou cancelar inscrições. A consequência de exposição pública foi apresentada e aceita expressamente. As ações não identificam uma pessoa da equipe. Administração, perfis e auditoria técnica não se tornam públicos. Piscina/Academia/Osteria abrem imediatamente nas abas e reutilizam a sessão da origem; manter autenticação dos sistemas atuais, não removê-la. Esta decisão substitui a exigência anterior de identidade individual e incorporação iniciada por botão.

## Objetivo único

A recepção trabalha em um só local: reserva piscina e academia, consulta e reserva Osteria, consulta vagas e inscreve hóspedes no Cine/Pizza e acompanha o que acontece no hotel no dia. Recepção ou gerência cadastra a programação semanal; as atividades publicadas aparecem automaticamente na tela inicial.

## Sistemas atuais

- Piscina/Academia: https://agendamentosvalledincanto.vercel.app/recepcao
- Osteria: https://osteriadilucca.web.app/

Escolha explícita: abrir os sistemas atuais dentro do Portal inicialmente. Autenticação e reservas ficam nos sistemas de origem; não criar novos formulários de reserva externa ou conexões de banco nesta entrega. Cada tela abre a incorporação automaticamente e oferece alternativa em nova aba para bloqueios de iframe/cookies/login. A equipe mantém sua sessão na origem; Portal não captura credenciais nem garante persistência de cookies de terceiros. Não alterar os sistemas atuais, domínios, dados ou proteções para contornar bloqueios.

## Programação, Cine e Pizza

- Cadastro pela recepção e gerência: evento, local, início/fim no horário de Gramado, vagas e status rascunho/aberta.
- Atividades livres do hotel usam o mesmo fluxo de sessões/inscrições, sem um segundo banco de eventos. Limite técnico 10000 não é capacidade padrão: cada atividade informa sua capacidade; o formulário começa com12 e o operador ajusta antes de publicar.
- Hoje apresenta as atividades publicadas/concluídas do dia e da semana vigente; rascunhos e canceladas não são comunicados como programação vigente.
- Cine e Pizza continuam com sessões e inscrições próprias e aparecem na semana.
- Cine: regras existentes preservadas,8adultos/4puffs; crianças nas observações.
- Pizza: limite padrão20pessoas incluindo adultos e crianças. Recepção e gerência podem exceder somente por exceção explicitamente autorizada e justificada. A justificativa e o ator ficam no histórico de auditoria. Isso não aumenta permanentemente a capacidade da sessão.
- Sessões históricas conservam a capacidade explicitamente definida; novas sessões Pizza começam com20. Não reinterpretar silenciosamente antigas observações CHD como quantidade de crianças: revisão manual necessária.
- A programação deixa de depender do comunicado fixo em código. O comunicado anterior09–12/10 é preservado como referência histórica em HOME_PROGRAM_NOTICE.md e no componente antigo; não convertido automaticamente sem revisão de horários/vagas pela equipe.

## Dados, segurança e qualidade

Portal usa somente banco/Auth próprios para programação, sessões, inscrições e auditoria. Quando o modo público está explicitamente habilitado no banco, cria automaticamente uma sessão anônima técnica, sem cadastro, e-mail ou senha. Perfil operacional fixo, ativo/sessão viva, RLS, idempotência, controle de versão e capacidade atômica permanecem. UUID técnico não identifica operador humano; configurações e auditoria ficam restritas. Desabilitar modo público revoga acesso das sessões anônimas em cada autorização. Contagens de crianças aplicam Pizza; não mudam regras externas.

America/Sao_Paulo para datas e horários. Dados fictícios nos testes, nenhuma credencial em código/browser/logs. Ausência de configuração ou falha de consulta nunca significa dia vazio. Não habilitar cadastro público na prévia sem ENV.

Usar identidade visual do hotel, teclado e layouts desktop/tablet. Testar regras alteradas, preview, build e banco isolado; registrar exatamente as verificações executadas e as pendentes. Revisão independente conforme AGENTS.md.

## Fora do objetivo

Estadias, PMS, rastreamento/localização de hóspedes, relatórios analíticos, Power BI, portal do hóspede, importação de planilhas e novas integrações diretas de banco não fazem parte deste pedido. Código anterior preservado não autoriza retomá-los.

## Critérios de aceite

1. Hoje comunica o dia/semana e dá acesso às reservas.
2. A equipe abre os sistemas atuais dentro do Portal, com alternativa direta.
3. Recepção e gerência criam/editam/publicam sessões e gerenciam inscrições; salvar atualiza Hoje/Programação.
4. Pizza conta crianças, recusa exceder capacidade sem justificativa e registra exceções com ator sem perder o histórico.
5. Prévia sem banco mantém ações próprias desabilitadas e estados honestos.
