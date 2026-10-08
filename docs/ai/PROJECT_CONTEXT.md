# Contexto — Portal da Recepção

Decisão mais recente ADR-022: acesso inicialmente público sem senha, dados/inscrições consultáveis e editáveis por qualquer pessoa com o endereço, exposição expressamente aceita. Sessão anônima técnica automática conserva RLS/atomicidade; não identifica operador. Configurações/auditoria administrativas fechadas. Sistemas externos abrem imediatamente, conservando sessão e autenticação de origem. Banco próprio hhtwewjihvqhkmpodeek provisionado; nove migrations aplicadas; domínio principal publicado e entrada automática validada. O contexto de identidade individual abaixo vale somente para modo público desativado.

Objetivo vigente em07/10/2026: centralizar o trabalho diário da recepção do Hotel Valle D'Incanto, Gramado/RS, em um local. Requisitos completos em MASTER_REQUEST.md; decisões ADR-020/021 em DECISIONS.md. O contexto antigo está em ../history/PROJECT_CONTEXT_BEFORE_RECEPTION_SCOPE.md.

Hoje informa programação diária/semanal e dá atalhos para reservas. Programação organiza atividades com vagas/inscrições, mantidas pela recepção e gerência. Cine e Pizza conservam seus fluxos próprios. Piscina/Academia e Osteria abrem os sistemas existentes dentro do Portal; cada origem conserva seu acesso e suas regras.

Perfis recepcao/gerencia/admin ativos podem gerir sessões, programação e inscrições. Configurações e usuários continuam administrativos. Relatórios e estadias fora do objetivo.

Pizza tem limite padrão20pessoas, incluindo crianças. Exceder requer autorização explícita e justificativa da recepção ou gerência. Cine conserva8adultos/4puffs e crianças nas observações. Atividade é uma sessão de programação com data, horário, local, capacidade e inscrições; programação é a projeção dessas sessões, sem segunda fonte.

Prévia local sem ENV continua demonstrativa; site hospedado conecta Supabase próprio e permite operações sem senha. Fonte de continuidade: PROGRESS.md e KNOWN_ISSUES.md.
