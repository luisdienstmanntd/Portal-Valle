# Publicação Vercel — 07/10/2026

Projeto próprio: portal-valle. Conta autenticada: luisdienstmanntd-9106; escopo luisdienstmanntd-9106s-projects. ID prj_psJ9dC854NqcVOwI5OqZaKs6fWcO.

URL estável: https://portal-valle-eight.vercel.app/hoje
Deployment: dpl_9aU5dzoYCU3QFPx3Nb5azNRREYgi, READY; URL imutável https://portal-valle-fx42wy00j-luisdienstmanntd-9106s-projects.vercel.app.

Publicação manual da cópia local baseada em fd53cee, com vercel.json e .vercelignore. O comando solicitou target preview; a Vercel atribuiu o primeiro deployment ao target production e ao alias estável. A publicação é de preparação: não há banco/Auth configurados, hóspedes ou cadastros operacionais do Portal. Nenhum deployment externo foi alterado. GitHub ainda não vinculado para deploy automático; PR #3 não integrado.

Framework Next.js explícito no vercel.json, Node24 pelo package.json. .vercel/project.json fica ignorado; arquivos locais de ambiente, work/, builds e resultados de testes não são enviados (.vercelignore). Sem credenciais no código.

Verificação: build remoto PASS; inspect READY; oito rotas respondem HTTP200 (Hoje, Piscina, Academia, Osteria, Programação, Pizza, atividades e login). Navegação e abertura das telas reais de login de Piscina/Academia e Osteria verificadas em browser no endereço hospedado. Login/reservas reais não realizados.

Para ativar programação, Cine e Pizza: provisionar Supabase/Auth exclusivos; aplicar migrations revisadas; desabilitar signup público no hosted; configurar as três variáveis públicas validadas em .env.example, criar perfis individuais e validar permissões. Criação do projeto Supabase ainda bloqueada: get_cost indisponível no conector; plano gratuito conectado já tem dois projetos ativos. Não usar bancos existentes.

Antes de cada publicação, executar vercel project inspect --non-interactive e conferir este destino. Usar vercel deploy --target preview para futuras prévias e inspecionar o target efetivamente criado. Não promover para operação real antes da configuração e verificação do banco próprio.
