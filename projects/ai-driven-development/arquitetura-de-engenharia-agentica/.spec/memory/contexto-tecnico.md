# Contexto Técnico Global

## Stack base

- TypeScript em todo o projeto
- front-end web em **Next.js**
- back-end em **NestJS**
- banco relacional com Postgresql (ORM Prisma)
- API Rest com JSON
- namespace npm: `@cadastro-base`
- domínio principal: módulo `customer` em `modules/`

## Decisões já tomadas

- arquitetura simples, legível e incremental (sem abstrações antecipadas)
- contratos e utilitários compartilhados concentrados em `packages/shared`
- base compartilhada no backend Nest com filtro global e tratamento centralizado de erro
- evolução do produto por mudanças pequenas e rastreáveis (uma spec por entrega)

## Restrições

- cada mudança deve caber em uma spec objetiva
- manter o projeto pequeno o suficiente para ensino em aula

## Padrões de integração

- front-end consome API REST
- validações simples acontecem no client e no server
- erros de domínio e validação são tratados de forma padronizada no backend
- respostas de erro da API devem ser exibidas de forma compreensível no front
