# Contexto — Portal da Recepção

Objetivo vigente em07/10/2026: centralizar o trabalho diário da recepção do Hotel Valle D'Incanto, Gramado/RS, em um local. Requisitos completos em MASTER_REQUEST.md; decisões ADR-020/021 em DECISIONS.md. O contexto antigo está em ../history/PROJECT_CONTEXT_BEFORE_RECEPTION_SCOPE.md.

Hoje informa programação diária/semanal e dá atalhos para reservas. Programação organiza atividades com vagas/inscrições, mantidas pela recepção e gerência. Cine e Pizza conservam seus fluxos próprios. Piscina/Academia e Osteria abrem os sistemas existentes dentro do Portal; cada origem conserva seu acesso e suas regras.

Perfis recepcao/gerencia/admin ativos podem gerir sessões, programação e inscrições. Configurações e usuários continuam administrativos. Relatórios e estadias fora do objetivo.

Pizza tem limite padrão20pessoas, incluindo crianças. Exceder requer autorização explícita e justificativa da recepção ou gerência. Cine conserva8adultos/4puffs e crianças nas observações. Atividade é uma sessão de programação com data, horário, local, capacidade e inscrições; programação é a projeção dessas sessões, sem segunda fonte.

Prévia local sem ENV; Supabase/Auth hospedados próprios ainda não provisionados. Não confundir UI/preparação com serviço operacional. Fonte de continuidade: PROGRESS.md e KNOWN_ISSUES.md.
