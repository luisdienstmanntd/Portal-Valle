# Pendências vigentes — reformulação07/10/2026

Publicação Vercel07/10: portal-valle-eight.vercel.app em preparação, build/READY/8rotas200 e login iframe dos dois sistemas verificados. Banco/Auth próprios continuam pendentes. Detalhes em ../architecture/VERCEL_DEPLOYMENT.md.

- Supabase/Auth próprios hospedados ainda não provisionados; prévia sem ENV não aceita cadastro/inscrições. Migration nova só versionada e validada em banco local isolado após testes.
- Login/reserva real em iframe não testado; alternativa em nova aba. HEAD200sem bloqueio não comprova cookies/autenticação.
- Observações históricas CHD não podem ser convertidas automaticamente em quantidade de crianças. Revisar antes de usar Pizza com dados anteriores.
- Sessões históricas com limite12mantêm seu limite explícito; novas Pizza começam com20. Equipe pode editar sessões até20, desde que não reduza abaixo da ocupação.
- Atividades gerais ainda contam adultos, mantendo regra existente; inclusão de crianças em sua capacidade não foi solicitada. Pizza conta todos.
- Comunicado09–12/10 preservado como referência histórica, sem importação automática de horários/vagas incompletos.
- CI37683235074 PASS:209pgTAP,7HTTP,14AuthUI e concorrência; PostgreSQL portátil valida SQL com auth.users/sessions e funções JWT mínimas de fixture, não substitui GoTrue/PostgREST.

## Histórico anterior — consultar requisitos atuais antes de agir

# Pendências e riscos conhecidos



Atualizado na Fase 8. O Portal ainda não está em produção.

1. **Integrações sem acesso comprovadamente read-only.** Facilities expõe grants operacionais ao service_role; Osteria oferece escrita à conta comum. Bloqueia habilitação das Fases 11/12; não bloqueia fundação e experiências próprias.
2. **Associação runtime Facilities não confirmada.** Projeto Supabase homônimo tem schema coincidente, mas a URL da aplicação vem de ENV não consultada. Validar por metadados do deploy na fase de integração sem ler/expor segredo.
3. **Drift Git/banco Osteria.** Catálogo atual inclui `status_recepcao` e a API de migrations retorna somente a migration 20260929234853; o snapshot Git auditado tem 15 migrations anteriores. Entender histórico aplicado antes de criar contract test; não reaplicar migrations antigas.
4. **Views Osteria amplas.** Incluem campos pessoais/financeiros e `reloptions` sem `security_invoker`. Não são contrato mínimo pronto. Revisar na fase apropriada.
5. **Políticas ainda pendentes.** Cine 8 vagas por adultos/4puffs; crianças somente nas observações com idade; distribuição exclusiva provisória ceil(adults/2). Lora adiada com capacidade inicial 12 adultos; Pizza 12 adultos. Política no_show segue pendente. Redução respeita ocupação atomicamente; responsável é login criador. Confirmar eventual compartilhamento e regras antes de dados reais.
6. **Retenção LGPD do Portal não definida.** Hotel deve definir finalidade e prazo de exclusão/anonimização de nome, apto, telefone, observações e trilha de auditoria antes de usar dados reais.
7. **Supabase hospedado adiado por quota gratuita.** Proprietário escolheu organização luisdienstmanntd e São Paulo, confirmou custo consultado US$ 0/mês. Criação recusada por limite de dois projetos gratuitos ativos; proprietário escolheu validar em CI e adiar hospedagem. Nenhum projeto foi criado/pausado/excluído, nem plano alterado. Resolver quota/custo e confirmar backups antes de dados reais. Vercel ainda não provisionada.
8. **Limites de validação da interface.** Stack da Fase 1 passou localmente e em GitHub Actions/Node 24.21.0. Fase 2 testada em Chromium a 1440×1000, 768×1024, 1024×768 e 390×844. Tablet físico, Safari/VoiceOver e Firefox ainda não verificados. ESLint 9.39.5 emite aviso de depreciação; manter pin até a cadeia do Next declarar compatibilidade com ESLint 10.
9. **Estado implantado dos sistemas externos desconhecido.** Auditoria de código + catálogo não comprova commit atual do deploy nem contrato seguro de API. Testar somente em contexto autorizado e sem mutações de produção.
10. **Auth Facilities não é modelo reutilizável para o Portal.** O código auditado usa senha de recepção compartilhada, sem identidade individual. Portal exige Auth próprio e auditoria por operador. Nenhuma alteração ao legado foi feita.
11. **Encerramento do webServer no Playwright/Windows.** Playwright pode não encerrar automaticamente o Next que criou como `webServer` neste host. Com servidor pré-iniciado, `npm run test:e2e` termina com exit code 0. Ciclo Linux passou no CI da Fase 1; o encerramento automático no Windows não foi resolvido.
12. **Fluxos operacionais validados em CI.** Cine usa os formulários e AlertDialog; prévia sem ENV desabilita operações. UI com Auth/banco testada em CI isolado; tablets físicos seguem pendentes.

13. **Docker ausente neste Windows.** CLI 2.119.0 funciona com SUPABASE_HOME no workspace; PostgreSQL/pgTAP/HTTP são validados em CI Linux isolado. Não afirmar execução local desses testes. CI local não comprova configuração/backup do futuro SaaS.
14. **Auth hospedado e equipe real ainda desconectados.** Proxy/setAll/login/logout implementados na Fase 4; validação real em CI isolado. Nesta prévia sem ENV, login está desabilitado e o shell é somente preparação. Tipos continuam contrato manual; regenerar do schema hospedado. Provisionamento real requer contas individuais e confirmação da matriz de permissões antes de uso operacional.

Fases 5/6 concluídas; Fase 8 Pizza validada no CI37158542094 PASS; APROVADO TECNICAMENTE pelo revisor independente. A interpretação de proibição de crianças do Cine foi substituída pela regra do proprietário: crianças nas observações, sem ocupar vagas de adultos. Lora adiada, capacidade inicial 12 registrada. no_show bloqueia novas operações de capacidade. Pontos 1–4 continuam gates das integrações.

Fase9 validada no CI37168649494: duplicação exige destino sem nenhuma sessão (inclusive cancelada), máximo100sessões. Somente Cine/Pizza, Lora adiada. Sessões são agrupadas pelo início; cruzar meia-noite não cria segundo evento. Advisory global serializa alterações operacionais de sessões; SQL administrativo privilegiado não é caminho operacional suportado. Prévia sem ENV não comprova Auth/banco hospedado.

Fase9 CI37168251847/994642e: checks/e2e PASS,196pgTAP/7HTTP e checkpoints semanal/Cine/Pizza PASS; Auth13/14, locator aguardava título repetido na lista antes do redirect. Corrigido para heading level1 sem remover assertions. Cobertura adicional de editar/cancelar cópia e reflexão na semana; faixa1900–2099 em nova migration20261004013531, não editar versão já publicada. Navegação extrema omitida, destino padrão fora da faixa fica vazio; CI da correção37168649494 PASS.

Resultado final Fase9: CI37168649494/509542335c787ad4dde34635aa1b9290d1431dd9 PASS: 89 unit, 36 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints de duplicação concorrente/criação manual/idempotência/sem inscrições, Cine/Pizza, advisors e cleanup PASS.

Fase 10: prévia sem ENV não comprova ausência de sessões. Timeline inclui somente sessões próprias, sem reservas/ocupação; excesso de100 ou DTO inválido falha integralmente a fonte. Facilities/Osteria ainda não conectadas. Fixture Auth Hoje usa relógio real; virada de dia entre seed e teste pode requerer nova execução. CI37170139071 PASS; APROVADO TECNICAMENTE.

Fase10 CI concluído: CI37170139071/c639381de43eb842e955f54242965817794f68b2 PASS: 97 unitários, 40 prévias E2E, 198 pgTAP, 7 HTTP e 14 Auth E2E; checkpoints Agenda/Cine/Pizza/semana, advisors e cleanup PASS. Fixture Hoje passou. O risco raro de virada do dia permanece não bloqueante. Fase11: renovação adicional de RLS/views no hospedado recusada pela revisão automática; autorização específica solicitada naquela etapa e posteriormente concedida. Grants já consultados ainda incluem escrita; nenhum acesso restrito comprovado, integração desabilitada.

Fase11: autorização adicional de metadados concedida e consulta concluída. RLS=true/policies=[]/views=[]; credencial SELECT-only não evidenciada. Factory de produção null; sem integração operacional. Contratos preparados, CI37170970533 PASS, APROVADO TECNICAMENTE (preparação). Não exibir zero para desconhecido/falha.

Resultado preparação Fase11: CI37170970533/0630c5374590375e91059f40691f5082e4df9ca9 PASS: 103 unitários, 44 prévias E2E, 198 pgTAP, 7 HTTP e14 Auth E2E; checkpoints/advisors/cleanup PASS. Integração operacional continua pendente; nenhum acesso externo de leitura de reservas foi habilitado.

Fase12: acesso SELECT-only Osteria não comprovado; factory null. Projeção requer join mínimo tipo, completo e validado; schema/live metadata ainda a confirmar em ambiente autorizado. Sem leitura real, pessoas/mesas na prévia ou alterações externas. CI37171940544 PASS; APROVADO TECNICAMENTE (preparação).

Fase13: Home apresenta estado preparado das quatro áreas; Facilities/Osteria continuam unknown, não fontes operacionais. SemENV Portal tambémunknown; não afirmar dia vazio.117unit/check PASS; build/52 prévias E2E PASS; CI/revisão pendentes.

Resultado Fase13: CI37524673713/49a47225c1db66856ba5ab3ddfd763e57fb51bd9 PASS:117unit/52prévia/198pgTAP/7HTTP/14Auth; advisors/checkpoints/cleanup PASS. Conexões externas seguem pendentes.

2026-10-06 — Fase14: matriz resiliência9falhas (offline/timeout/schema x Portal/Facilities/Osteria), paralelo, recuperação e resposta tardia. ENV ausente/parcial/chave administrativa testados.132unit/check locais PASS; CI/revisão pendentes. Somente testes/docs, sem falhas induzidas em bancos reais, runtime inalterado.

Resultado Fase14: CI37525732273/aa5438f750c742786064b3e6cf4f40c291e3686a PASS:132unit/52prévia/198pgTAP/7HTTP/14Auth; build/advisors/checkpoints/cleanup PASS. Revisão final em fechamento.

2026-10-06 — Solicitação do proprietário: programação do log no início de Hoje. Informativo Bem-estar09–12/10/2026 confirmado (sexta a segunda), transcrição sem PII, dias expansíveis. Substitui welcome banner; não altera reservas/capacidades nem conecta log. Inserção manual em código; editor recorrente pendente. Check132/build PASS; validação final E2E/CI/revisão em andamento.

Resultado aviso programação: CI37527250539/a36c41b572c184be4d2ee7c7af47109bd952e5a8 PASS:132unit/52prévia/198pgTAP/7HTTP/14Auth, build/advisors/checkpoints/cleanup PASS. Conferência com imagem original pelo autor e revisor; datas09–12/10 confirmadas. Parecer final em fechamento.

2026-10-06 — Fase15 conceitual: proprietário escolheu cadastro próprio com apartamento/entrada/saída e vínculos explícitos. Modelo/GetStayAgenda validados, sem inferência por coincidência, readersprodução inexistentes, nenhum DB alterado. /estadias prepara cadastro, controles desabilitados.142/check/build PASS; E2E/CI/revisão pendentes. Operação cadastral/vínculos ainda pendente.

Resultado conceito15: CI37529212227/f6e5f5cac43ed7c8beaa5cdf78ad494ee201a256 PASS:142unit/56prévia/198pgTAP/7HTTP/14Auth; build/advisors/checkpoints/cleanup PASS. Revisão final em fechamento; cadastro/vínculos operacionais não habilitados.

Cadastro15: sem editar/excluir estadias neste recorte; correção de datas e apartamento pendente antes de dados reais. Lista limitada a100, excedente gera falha explícita; paginação pendente. Não impede CI sintético. Reservas permanecem sem vínculo.

Limite100 corrigido antes da publicação: lista paginada50+1 por cursor validado, com próxima/primeira página. Excesso legítimo não bloqueia cadastro.

Vínculo15: pgTAP do vínculo não executado localmente (sem Docker); validar na CI. Candidatas listadas por apartamento (ilike) apenas como sugestão; a RPC recusa apartamento/período divergentes. Edição de apartamento/datas da estadia continua pendente; estadia com reservas vinculadas não pode ser excluída (FK restrict). Sem E2E Auth do vínculo ainda.

Vínculo15 revisão: apartamento da reserva e início da sessão vinculadas agora são protegidos por triggers (E_PERIOD); mudar exige desvincular antes. Desvincular reserva cancelada é permitido. Pendentes não bloqueantes: paginação/limite de loadStayBookings, erro por código em vez de query string, caso de fronteira de fuso e perfil inativo no pgTAP. pgTAP segue sem execução local.

2026-10-07 — Estadias cancelada: pendências de cadastro/vínculo/pgTAP da Fase15 deixam de existir. Verificar na CI que nenhum teste referencia estadias.
