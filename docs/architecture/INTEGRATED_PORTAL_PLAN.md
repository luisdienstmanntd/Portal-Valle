# Portal único — plano de integração (proposta, aguardando autorização por etapa)

Decisão do proprietário em 2026-10-07 (ADR-019): ver e cadastrar reservas de Piscina, Academia e Osteria dentro do Portal; os sites atuais continuam como fonte da verdade e o Portal chama **funções seguras** em cada sistema. "Onde os hóspedes estão" = atividade em andamento agora, derivada de reservas existentes; sem rastreamento nem check-in novo.

## Arquitetura

Portal (servidor) → credencial restrita por sistema → view de leitura / função de escrita no banco do sistema. Nenhuma chave administrativa, nenhum código legado importado, nada de credencial no browser. Autorização de quem pode ver/cadastrar fica no Portal (permissões centrais) e é reaplicada por nova checagem no servidor antes de cada chamada.

| Etapa | Entrega | Mexe no legado? | Estado |
|---|---|---|---|
| 1 | Leitura Piscina/Academia (`docs/integrations/facilities-readonly`) | Sim: view + papel somente leitura, aplicada pelo dono | Pacote pronto e testado em PG local; não aplicada |
| 2 | Adapter real do Portal para o papel de leitura (transporte Postgres, ENV de servidor, factory habilitada só com ENV) + telas com dados reais | Não | Depende da etapa 1 aplicada em teste |
| 3 | Leitura da Osteria (view mínima sem telefone/obs, papel próprio) | Sim | Não iniciada; auditoria mostra RLS FOR ALL e schema remoto divergente |
| 4 | Escrita Piscina/Academia: `portal_create_reservation` / `portal_cancel_reservation` no banco legado | Sim | Não iniciada |
| 5 | Escrita Osteria | Sim | Não iniciada |
| 6 | Painel "Agora": quem está em atividade (Cine, Pizza, Piscina, Academia, Osteria) | Não | Depende de 2 e 3 |

## Contratos das funções de escrita (etapa 4, a desenhar com o dono)

- Entrada validada no banco (instalação pool|gym, data civil America/Sao_Paulo, slot de 60 min permitido por instalação, apartamento no padrão existente); só o papel do Portal executa.
- Capacidade e duplicidade seguem as unicidades já existentes no legado (instalação+data+slot e instalação+data+apartamento); conflito vira erro tipado, nunca sobrescrita.
- Idempotência: o legado não tem tabela de requisições; a função precisa de chave de requisição própria (tabela mínima no schema do Portal dentro do banco legado) ou de retentativa segura pela unicidade. Decidir antes de implementar.
- Cancelamento no legado é DELETE; o Portal precisa de trilha própria de auditoria (quem cancelou) fora da tabela.
- Regra do legado de hóspede (estadia validada por token, checkout) não se aplica à recepção; o Portal só cadastra como recepção.

## Painel "Agora"

Usa o horário atual civil e as reservas do slot corrente. Mostra apartamento e atividade; nome/telefone só se uma decisão futura justificar. Isso exige a etapa 1 estendida: uma segunda coluna `apartment_number` na view, por permissão, o que o pacote atual NÃO expõe de propósito. Desconhecido nunca vira "ninguém está".

## Conflito com regras atuais

AGENTS.md proíbe alterar os sistemas legados "para viabilizar o Portal" e limita integrações iniciais a leitura. A escolha do proprietário exige exceção explícita por etapa (1, 3, 4, 5), com migration própria do sistema externo, teste dele e aplicação primeiro em ambiente de teste. O texto de AGENTS.md não foi alterado; sugestão de redação: "Alterações no legado só com autorização explícita do proprietário por etapa, em ambiente de teste primeiro, sem uso de chave administrativa pelo Portal."

## Riscos

Dois sistemas gravando ao mesmo tempo (site antigo e Portal) dependem só das unicidades do banco; dados pessoais de hóspedes passando a ser exibidos; credencial nova por sistema; LGPD (a anonimização do legado só cobre nome e WhatsApp). Hospedado Portal e testes de integração contra ambientes reais seguem pendentes.
