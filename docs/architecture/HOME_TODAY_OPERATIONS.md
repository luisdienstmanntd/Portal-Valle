# Home Hoje — agregação diária

GetHotelDay usa o GetDailyAgenda próprio e readFacilityDay(pool/gym)/readOsteriaDay. As quatro cargas são independentes por allSettled; deadlines existentes abortam fontes e limitam providers não cooperativos. Inputs de data/timeout validados antes da carga. Uma falha não remove atividades válidas de outra fonte. Sem logs ou mensagens técnicas brutas no DTO.

Homepage exige portal.read antes de construir fontes. Guard devolve Staff existente, sem nova busca de usuário. can experiences.read/facilities.read/osteria.read impede chamadas de fonte sem permissão. Sem Auth só shell de preparação; externos null incondicionalmente e provider Portal desconhecido. Conexões11/12 não foram habilitadas.

Cards: unknown significa desconectado; unavailable falha; empty consulta completa sem atividades; available consulta válida com atividades. Summary=null em desconhecimento/falha. Não somar uma capacidade global nem produzir falso zero. Experiências contam sessões de todos os estados como sessões na agenda; Facilities conta horários reservados; Osteria conta reservas ativas e pessoas incluindo room service, canceladas fora do resumo ativo.

Timeline mínima: id composto, título, início, fim opcional, detalhe operacional sem identidade, estado e link interno. Agrupamento pelo início civil, ordenação por instante/ID. Facilities IDs incluem instalação; Osteria preserva segundos e end=null, sem duração presumida. Canceladas exibidas distintamente. Vazio global somente se as quatro fontes forem empty; pendência/falha mantém aviso de consulta incompleta. FetchedAt apenas quando consulta foi tentada; erros inesperados do agregador não inventam timestamp.

Portal pode apresentar sessões reais de teste enquanto externos seguem unknown. Dados fictícios entram somente em testes unitários/CI, não na prévia ou factories de produção. Sem persistência ou compartilhamento de dados externos. Links para módulos preservam suas permissões e operação especializada.
