# Sincronização Prisma por Módulo

## Objetivo

Sincronizar um único módulo do domínio com a camada Prisma do backend, mantendo o schema modular e as migrations incrementais alinhadas com as entidades do módulo.

## Paths principais

- Módulos de domínio:
  - `modules/<modulo>/src/**/*.entity.ts`
- Base de entidades:
  - `packages/shared/src/model/entity.ts`
- Schema Prisma raiz:
  - `apps/backend/prisma/schema.prisma`
- Modelos Prisma por modulo:
  - `apps/backend/prisma/models/<modulo>.model.prisma`
- Migration SQL:
  - `apps/backend/prisma/migrations/*/migration.sql`
- Comandos Prisma:
  - `apps/backend/package.json`

## Checklist operacional

### 1. Ler o módulo

- [ ] Confirmar que o módulo foi explicitamente informado pelo usuário ou por contexto inequívoco.
- [ ] Se o módulo não estiver claro, interromper a execução e pedir ao usuário o módulo alvo antes de continuar.
- [ ] Confirmar o nome e o path do módulo em `modules/<modulo>`.
- [ ] Listar as entidades `*.entity.ts`.
- [ ] Identificar as classes que herdam de `Entity<TState>`.
- [ ] Extrair os campos do `State` e os herdados de `EntityState`.

### 2. Atualizar o schema Prisma

- [ ] Criar ou editar somente `apps/backend/prisma/models/<modulo>.model.prisma`.
- [ ] Garantir um model Prisma por entidade persistível.
- [ ] Incluir `id`, `createdAt`, `updatedAt` e `deletedAt` quando fizerem parte da base compartilhada.
- [ ] Manter nomes e tipos consistentes com o domínio.
- [ ] Revisar relações, nulabilidade e índices apenas quando isso estiver claro no código.

### 3. Gerar migration

- [ ] Se for a primeira migration do módulo, usar `<modulo>`.
- [ ] Se for ajuste incremental, usar `<modulo>-<sufixo-curto>`.
- [ ] Subir o banco se ele não estiver disponível:
  - `npm --workspace apps/backend run db:start`
- [ ] Rodar a migration:
  - `npm --workspace apps/backend run prisma:migrate:dev -- --name <migration-name>`
- [ ] Rodar a geração do client:
  - `npm --workspace apps/backend run prisma:generate`

### 4. Validar o resultado

- [ ] Revisar o SQL gerado quando houver rename, drop, alteração de tipo ou mudança de nulabilidade.
- [ ] Confirmar que o arquivo Prisma do módulo ficou coerente com as entidades lidas.
- [ ] Se o schema estava sincronizado, registrar isso explicitamente em vez de forçar mudanças.

## Convenções recomendadas

- Manter um arquivo Prisma por modulo.
- Nomear migrations em kebab-case.
- Usar sufixos curtos e descritivos para migrations incrementais.
- Preservar o idioma e o estilo de código já adotados pelo projeto.
- Evitar `@map`/`@@map` desnecessários.

## Armadilhas comuns

- Prosseguir inferindo um módulo quando o usuário ainda não informou qual módulo deseja sincronizar.
- Ignorar campos herdados de `EntityState`.
- Criar schema Prisma para classes que não são entidades persistíveis.
- Inferir relações que não aparecem claramente no domínio.
- Gerar migration com nome genérico demais, como `update` ou `fix`.
- Alterar arquivos de outros módulos sem necessidade.
- Manter `bootstrap.model.prisma` quando o projeto ja possui modelos reais suficientes para substitui-lo.
