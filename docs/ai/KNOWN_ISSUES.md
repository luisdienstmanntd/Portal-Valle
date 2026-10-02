# Pendências e riscos conhecidos

Atualizado na Fase 1. O Portal ainda não está em produção.

1. **Integrações sem acesso comprovadamente read-only.** Facilities expõe grants operacionais ao service_role; Osteria oferece escrita à conta comum. Bloqueia habilitação das Fases 11/12; não bloqueia fundação e experiências próprias.
2. **Associação runtime Facilities não confirmada.** Projeto Supabase homônimo tem schema coincidente, mas a URL da aplicação vem de ENV não consultada. Validar por metadados do deploy na fase de integração sem ler/expor segredo.
3. **Drift Git/banco Osteria.** Catálogo atual inclui `status_recepcao` e a API de migrations retorna somente a migration 20260929234853; o snapshot Git auditado tem 15 migrations anteriores. Entender histórico aplicado antes de criar contract test; não reaplicar migrations antigas.
4. **Views Osteria amplas.** Incluem campos pessoais/financeiros e `reloptions` sem `security_invoker`. Não são contrato mínimo pronto. Revisar na fase apropriada.
5. **Política operacional de capacidade ainda incompleta.** Confirmar unidade do Cine, contagem de crianças, `no_show`, redução de capacidade e significado de `responsável` antes da Fase 5/6.
6. **Retenção LGPD do Portal não definida.** Hotel deve definir finalidade e prazo de exclusão/anonimização de nome, apto, telefone, observações e trilha de auditoria antes de usar dados reais.
7. **Conta/região/custo Supabase e Vercel não escolhidos.** Nenhum projeto Portal ou deploy foi criado. Definir região, plano, backups e segregação preview/produção nas fases apropriadas.
8. **Stack testada apenas localmente.** Instalação, lint, TypeScript, unit, build e HTTP E2E passaram com Node 24.14.1. CI em GitHub/Node 24.21.0 e tablets reais ainda precisam de verificação. ESLint 9.39.5 emite aviso de depreciação; manter pin até a cadeia do Next declarar compatibilidade com ESLint 10.
9. **Estado implantado dos sistemas externos desconhecido.** Auditoria de código + catálogo não comprova commit atual do deploy nem contrato seguro de API. Testar somente em contexto autorizado e sem mutações de produção.
10. **Auth Facilities não é modelo reutilizável para o Portal.** O código auditado usa senha de recepção compartilhada, sem identidade individual. Portal exige Auth próprio e auditoria por operador. Nenhuma alteração ao legado foi feita.
11. **Encerramento do webServer no Playwright/Windows.** O teste HTTP passa, mas um processo Playwright que cria o Next como `webServer` pode não encerrar automaticamente neste host. Com servidor pré-iniciado, o mesmo `npm run test:e2e` termina com exit code 0. Verificar job Linux do CI após publicação; não afirmar que o encerramento automático no Windows foi resolvido.

Próxima fase após autorização: shell e design system. Pontos 1–4 são gates das integrações, não razão para alterar os sistemas existentes agora.
