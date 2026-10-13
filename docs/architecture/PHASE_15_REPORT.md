# Fase15 — Visão Estadia

## Objetivo
Criar conceito agregador sem depender de PMS, preservando limites das fontes externas.

## Implementado
Escopo manual apartamento+período inclusivo até31dias; /estadias, navegação, inscrições próprias Cine/Pizza ordenadas, estados/cancelamentos e links de detalhe. Consulta não identifica hóspedes nem cria estadias. Integrações pendentes explícitas, unknown diferente de empty.

## Arquivos
modules/stays/{domain,application,infrastructure}, app/(portal)/estadias; navegação/CSS; testes unitários, preview e Auth; documentação operacional/memória.

## Banco
Sem migration/escrita; read-only na projeção mínima de inscrições próprias, sessão/RLS existentes. Nenhuma leitura/alteração externa ou PMS.

## Testes e resultado
Local lint/TypeScript/130unit/build/22resiliência PASS. Prévia:52 cenários existentes PASS;4novos inicialmente seletor alert ambíguo (announcer Next), corrigido teste e4/4PASS. CI completo em validação final.

## Riscos e pendências
Escopo manual não confirma hóspede/estadia; apartamento pode ser reutilizado. Limite100sessões antes do filtro e100inscrições: excesso indisponível, sem truncar. Catálogo ativo apenas. Fontes externas sem vínculo seguro continuam pendentes; hospedagem/retensão/backups/tablet físico pendentes.

## Commit e revisão
Pendentes após validação.

## Próxima fase
Fase16 Relatórios somente após dados confiáveis e nova autorização. Não iniciada.

## Validação manual
Informar apartamento/período, conferir inscrição e abrir detalhe. Conferir cancelamentos, não confundir visão parcial com totalidade de experiências. Em preparação semENV, nenhum falso zero.
