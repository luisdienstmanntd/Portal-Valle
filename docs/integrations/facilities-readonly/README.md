# Facilities — leitura somente (proposta, NÃO aplicada)

Passo 1 de qualquer integração com Piscina/Academia: o Portal enxergar as reservas do dia sem credencial administrativa.

- `001_portal_reader.sql`: schema `portal_readonly`, view com 4 colunas (id, facility, reservation_date, slot_start) e papel `portal_reader` sem login, somente leitura, com timeout e limite de conexões.
- `001_portal_reader_rollback.sql`: desfaz tudo.
- `001_portal_reader.test.sql`: teste em psql contra banco DESCARTÁVEL com o schema legado reconstruído da auditoria (dados fictícios). Validado localmente em PostgreSQL 16: PASS, incluindo reaplicação e rollback; duas mutações propositais (coluna extra, grant na tabela) reprovam o teste.

Limites: não foi aplicada a nenhum banco real; Supabase hospedado pode diferir do PostgreSQL local (pooler, roles gerenciados). Senha/login do papel são definidos pelo dono fora do repositório. Sem apartamento no DTO: exibir "onde o hóspede está" exigirá outra decisão (ver PROGRESS).
