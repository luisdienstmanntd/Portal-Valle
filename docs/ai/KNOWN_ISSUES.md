# Pendências e riscos conhecidos

Atualizado na Fase 2. O Portal ainda não está em produção.

1. **Integrações sem acesso comprovadamente read-only.** Facilities expõe grants operacionais ao service_role; Osteria oferece escrita à conta comum. Bloqueia habilitação das Fases 11/12; não bloqueia fundação e experiências próprias.
2. **Associação runtime Facilities não confirmada.** Projeto Supabase homônimo tem schema coincidente, mas a URL da aplicação vem de ENV não consultada. Validar por metadados do deploy na fase de integração sem ler/expor segredo.
3. **Drift Git/banco Osteria.** Catálogo atual inclui `status_recepcao` e a API de migrations retorna somente a migration 20260929234853; o snapshot Git auditado tem 15 migrations anteriores. Entender histórico aplicado antes de criar contract test; não reaplicar migrations antigas.
4. **Views Osteria amplas.** Incluem campos pessoais/financeiros e `reloptions` sem `security_invoker`. Não são contrato mínimo pronto. Revisar na fase apropriada.
5. **Política operacional de capacidade ainda incompleta.** Confirmar unidade do Cine, contagem de crianças, `no_show`, redução de capacidade e significado de `responsável` antes da Fase 5/6.
6. **Retenção LGPD do Portal não definida.** Hotel deve definir finalidade e prazo de exclusão/anonimização de nome, apto, telefone, observações e trilha de auditoria antes de usar dados reais.
7. **Conta/região/custo Supabase e Vercel não escolhidos.** Nenhum projeto Portal ou deploy foi criado. Definir região, plano, backups e segregação preview/produção nas fases apropriadas.
8. **Limites de validação da interface.** Stack da Fase 1 passou localmente e em GitHub Actions/Node 24.21.0. Fase 2 testada em Chromium a 1440×1000, 768×1024, 1024×768 e 390×844. Tablet físico, Safari/VoiceOver e Firefox ainda não verificados. ESLint 9.39.5 emite aviso de depreciação; manter pin até a cadeia do Next declarar compatibilidade com ESLint 10.
9. **Estado implantado dos sistemas externos desconhecido.** Auditoria de código + catálogo não comprova commit atual do deploy nem contrato seguro de API. Testar somente em contexto autorizado e sem mutações de produção.
10. **Auth Facilities não é modelo reutilizável para o Portal.** O código auditado usa senha de recepção compartilhada, sem identidade individual. Portal exige Auth próprio e auditoria por operador. Nenhuma alteração ao legado foi feita.
11. **Encerramento do webServer no Playwright/Windows.** Playwright pode não encerrar automaticamente o Next que criou como `webServer` neste host. Com servidor pré-iniciado, `npm run test:e2e` termina com exit code 0. Ciclo Linux passou no CI da Fase 1; o encerramento automático no Windows não foi resolvido.
12. **Primitivas sem fluxo operacional nesta fase.** Input/Label/Textarea/Select e AlertDialog são componentes preparados para os próximos formulários. Não há gravação nem confirmação destrutiva disponível na interface. Seus fluxos operacionais receberão testes quando implementados.

Próxima fase após autorização: banco exclusivo do Portal. Pontos 1–4 são gates das integrações, não razão para alterar os sistemas existentes agora.
