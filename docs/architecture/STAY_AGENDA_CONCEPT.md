> CANCELADO em 2026-10-07 por decisão do proprietário (ADR-018). Registro histórico; não implementar.

# Visão de estadia — conceito Fase15

Escolha do proprietário em06/10/2026: cadastro próprio com apartamento, entrada e saída; cada reserva vinculada explicitamente à estadia. Sem PMS. Apartamento não é identidade: hóspedes diferentes podem usá-lo. Nome/apartamento/data coincidentes não autorizam associação automática.

Modelo mínimo: UUID próprio Portal normalizado, apartamento descritivo e datas civis1900–2099, saída >= entrada. Não contém nome, telefone, notas ou dados financeiros. Ainda não há persistência de estadias. O check stay_id=null em bookings permanece intacto; nenhum registro foi reassociado.

GetStayAgenda agrega quatro readers por referência própria: Portal, Piscina, Academia, Osteria. Somente entradas com stayId idêntico são aceitas, com lote completo, schema estrito, limite técnico500/source e IDs únicos normalizados. IDs compostos impedem colisão entre fontes. Agrupa pelo dia de início America/Sao_Paulo e ordena por instante/chave. Inclui os dias civis de entrada/saída; não pressupõe horário de checkout. Fim null permitido sem duração inventada. Estados/cancelamentos preservados; linkedActivities conta vínculos de todos os estados, não ocupação/pessoas/reservas ativas.

Consultas paralelas/allSettled, deadline/abort e limpeza de timers. Reader ausente = unknown/count=null, falha = unavailable/count=null; empty significa apenas consulta completa sem atividades vinculadas, não ausência de atividades de toda a pessoa. Dados sem vínculo não entram. Erros brutos não saem no DTO. Não reutilizar os readers diários externos, pois não fornecem vínculos de estadia.

O conceito usa um Stay já validado fornecido pelo chamador; não resolve identidade nem comprova existência de um cadastro. GetStayAgenda é exercitado apenas por testes nesta entrega. Não existe reader de produção, factory habilitadora ou chamada desse agregador pela página. A nova rota /estadias guarda experiences.read e apresenta preparação, campos/botão desabilitados e nenhum apartamento/reserva fictícios. Menu ganha Estadias; Home/programação seguem preservados.

Operação pendente: tabela própria, RLS/permite leitura da equipe e escrita adequada, RPCs atômicos/idempotentes/auditados para cadastrar e vincular/desvincular com concorrência/versionamento. Validar apartamento/período do cadastro e vínculo explícito da reserva, sem alterar capacidade. Evoluir stay_id=null e modelos/RPCs existentes somente nessa entrega operacional, com testes SQL/HTTP/Auth. Associação externa exige acesso restrito e correlação explícita verificada; não criar campos/RPCs nos legados.

Correção local de ferramentas: lint exclui .next-program gerado pela prévia, assim como outros builds alternativos; a primeira checagem detectou arquivos gerados indevidamente analisados e foi corrigida sem tocar no build ativo.

Fase15 conceitual não equivale a cadastro/vínculos operacionais. Fase16 relatórios requer dados confiáveis e não deve produzir indicadores de fontes desconectadas.
