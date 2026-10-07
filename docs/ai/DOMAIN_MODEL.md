# Modelo vigente

Reusa experiences, experience_occurrences, experience_bookings, portal_profiles e audit_events. Descrição anterior em ../history/DOMAIN_MODEL_BEFORE_RECEPTION_SCOPE.md.

- Catalogo: Cine, Pizza, Atividades do hotel. Atividade de programação é occurrence com title_override, local, início/fim, vagas e status. Cada sessão é fonte única da semana e de Hoje.
- Inscrição: sessão, apartamento, nome, adultos, crianças, observações, status, presença e responsável. Cine/atividades gerais mantêm children=0 e crianças em observações; Pizza usa quantidade explícita de crianças incluída nas vagas.
- Pizza: default_capacity/person_limit20; sessão pode configurar capacidade menor. Inscrição que supera qualquer limite requer exception_reason10–1000caracteres, aceito somente no fluxo Pizza, com ator auditado. Soma adultos+crianças usa o lock da sessão.
- Programação livre: categoriaother/slugprogramacao-hotel, capacidade informada pelo operador, sem cadastro de catálogo ou motor genérico. Limite10000 é proteção técnica, não capacidade real ou padrão operacional.
- Usuário: perfil ativo recepcao/gerencia/admin vinculado ao Auth próprio. Recepção e gerência mantêm programação e inscrições; apenas admin configura.
- Auditoria: snapshots seletivos com exception_reason e contagens, ator derivado da sessão; imutável para clientes. Não registrar dados de hóspedes da origem externa no Portal.

Estadias/PMS não entram no modelo. Reservas externas pertencem aos sistemas existentes e são operadas nas telas incorporadas.
