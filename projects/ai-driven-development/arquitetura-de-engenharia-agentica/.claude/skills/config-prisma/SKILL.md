---
name: config-prisma
description: "Inicializar e padronizar a infraestrutura do Prisma no backend NestJS do Genérico com schema modular por domínio (`apps/backend/prisma/models/*.model.prisma`), entrypoint de seed técnico em `apps/backend/prisma/seed/main.ts` (sem seeds de módulos), configuração de `prisma.config.ts`, Docker Compose do backend compatível com `DATABASE_URL` do `.env` e com nomes derivados da identidade do projeto, e criação/ajuste de `DbModule` + `PrismaService` simples no padrão atual do projeto. Usar quando o pedido envolver setup inicial de Prisma, onboarding de módulos com arquivo Prisma próprio ou rebootstrap da infraestrutura de banco no backend."
---

# Config Prisma

## Overview

Executar setup determinístico da infraestrutura Prisma no `apps/backend`, com seed entrypoint neutro (sem tasks de módulo), módulo de banco no Nest e inicialização do Postgres via Docker Compose alinhada ao `.env`.
O contrato gerado de banco deve ficar compatível com a versão atual do projeto: `PrismaService` simples, sem `TransactionManager` nem `runInTransaction`, e infraestrutura Docker derivada da identidade do projeto para evitar colisões entre repositórios.

## Workflow

1. Confirmar que o workspace contém `apps/backend/package.json`.
2. Executar o script da skill (resolva o caminho com `find . -maxdepth 6 -path "*/config-prisma/scripts/init-prisma-backend.js" ! -path "*/node_modules/*" | head -1`):
   - `node <script> --dry-run`
   - `node <script> --apply --install`
3. Incluir arquivos Prisma por módulo (repetível):
   - `node <script> --apply --module auth --module product`
4. Subir banco com Docker Compose do backend:
   - `npm --workspace apps/backend run db:start`
5. Validar Prisma:
   - `npm --workspace apps/backend run prisma:generate`

## O que o script garante

- Dependências Prisma no `apps/backend/package.json` (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `tsx`) com preservação da versão já existente quando o backend já está configurado (sem upgrade forçado por padrão).
- Scripts npm de banco/Prisma (`db:start`, `db:stop`, `db:logs`, `prisma:generate`, `prisma:migrate:*`, `prisma:seed`, `prisma:studio`).
- Remoção de script legado `prisma:cid` quando presente.
- `apps/backend/prisma.config.ts` com `seed: 'npx tsx prisma/seed/main.ts'`.
- `apps/backend/prisma/schema.prisma` com `generator client { provider = "prisma-client-js" }` no padrão atual.
- `apps/backend/prisma/seed/main.ts` inicial (sem implementação de módulos) usando `PrismaClient` de `@prisma/client` com `PrismaPg`.
- Autocorreção apenas para templates legados de seed (`generated/client`, `generated/prisma`, `cid`) sem sobrescrever seeds modernos já estruturados com tasks de módulo.
- Não cria nem altera `prisma/seed/tasks/*` de módulos específicos.
- `apps/backend/prisma/models/bootstrap.model.prisma` temporário apenas quando ainda não existe nenhum `*.model.prisma` de domínio.
- Arquivos de módulos Prisma no padrão `<module-name>.model.prisma`.
- `apps/backend/docker-compose.yml` alinhado ao `DATABASE_URL` carregado de `apps/backend/.env` (fallback para `.env.example`) e com `name`, `container_name`, volume e defaults de conexão derivados do projeto atual.
- Criação/ajuste de `apps/backend/src/db/db.module.ts` e `apps/backend/src/db/prisma.service.ts`.
- `PrismaService` simples no padrão Nest atual, sem dependência de `TransactionManager`.
- Inclusão de `DbModule` em `apps/backend/src/app.module.ts` quando ausente.

## Notes

- O script é idempotente: pode ser executado várias vezes sem duplicar estrutura.
- O script instala usando o nome real do workspace lido de `apps/backend/package.json` (fallback: `apps/backend`).
- Quando `.env` ainda não define `DB_PORT`, `DB_USER` e `DB_NAME`, o script deriva defaults estáveis a partir do nome do projeto/package para gerar uma instância Docker exclusiva por repositório.
- Após criar modelos reais, remover `prisma/models/bootstrap.model.prisma` (se existir) e gerar nova migration.
- Em backends já evoluídos, o script evita regressão de `seed/main.ts` para template neutro quando o arquivo já estiver no padrão moderno com tasks registradas.
- Consultar `references/prisma-init-checklist.md` para checklist operacional.

## Risk Logging Guardrails

- Registrar fatos de execucao em `.log/skills.log` com marcador no inicio da linha.
- Marcadores minimos esperados: `[CMD]`, `[FILE_CREATE]`, `[FILE_UPDATE]`, `[FILE_DELETE]`, `[DIR_CREATE]`, `[RISK]`, `[FAIL]`, `[AI]`.
- Sempre registrar `[RISK]` quando houver sobrescrita, exclusao, rename/move, ou fallback forcado em arquivos/pastas.
- Toda falha inesperada deve gerar `[FAIL]` com descricao factual curta do evento.
- Operacoes de terminal e alteracoes de arquivos devem usar os utilitarios compartilhados da skill quando existirem; quando o projeto nao tiver essa pasta, o script deve funcionar com fallback local sem bloquear a execucao.

## Global Standards

- Priorizar compatibilidade com a estrutura real do monorepo atual e evitar referencias obrigatorias a arquivos auxiliares que nao existam no projeto.
