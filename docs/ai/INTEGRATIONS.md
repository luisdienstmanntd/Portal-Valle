# Sistemas atuais dentro do Portal

Escolha do proprietário07/10/2026: incorporação inicial, sem integração direta de bancos.

Piscina/Academia usa https://agendamentosvalledincanto.vercel.app/recepcao; Osteria usa https://osteriadilucca.web.app/. Ambos retornaram HTTP200 e sem X-Frame-Options/CSP no HEAD consultado. Isso não comprova autenticação em iframe. O endereço antigo valle-piscina-academia.vercel.app retornou404 e não deve ser usado.

ExternalWorkspace carrega iframe somente após ação, com título acessível, referrerPolicy=no-referrer e acesso alternativo em nova aba com noopener/noreferrer. Nunca ler DOM da origem, injetar scripts, capturar senhas ou criar sessão compartilhada. O browser autentica diretamente na origem.

PORTAL_FACILITIES_URL/PORTAL_OSTERIA_URL podem substituir os endereços por HTTPS sem credenciais embutidas. Página/Home não solicitam registros externos automaticamente. Sem webhook, sincronização, dados duplicados, novo papel de banco ou alteração de sistemas/deploys.

Caso a origem/login bloqueie iframe, a recepção usa nova aba. Não remover proteções da origem sem pedido explícito e revisão de uma proposta concreta. A confirmação funcional de login/reserva será feita pela equipe nas contas habituais; não reservar em produção como teste.

Os adapters/providers readonly existentes ficam inativos. O plano anterior de views/RPC externas foi substituído para esta entrega; auditorias e pacotes anteriores são preservados como referência em ../history/INTEGRATIONS_BEFORE_RECEPTION_SCOPE.md.
