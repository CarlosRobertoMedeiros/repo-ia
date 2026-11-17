# 001-criar-projeto

## Objetivo

Criar a base do projeto monorepo com backend, frontend, pacote compartilhado, Prisma e a infraestrutura de autenticação e tratamento de erros do backend.

## Contexto Técnico

- Monorepo Turbo com `apps/frontend` (Next.js na porta 3000) e `apps/backend` (NestJS na porta 4000).
- Namespace npm do workspace: `@sdd`.
- Persistência via Prisma, com schema modular por domínio.
- Autenticação baseada em JWT no backend, com tratamento de erros centralizado.
- Esta spec entrega apenas a base técnica. Módulos de negócio (ex.: `auth`/cadastro de usuário) são criados em specs posteriores.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- Nenhum módulo de domínio deve ser criado nesta spec; foco exclusivo em infraestrutura compartilhada.

## Tasks

### Tasks - Configuração

- [x] Criar a estrutura base do monorepo com a skill [config-project-fullstack](../../../.claude/skills/config-project-fullstack) usando o namespace `@sdd`.
  > ✅ 2026-11-16 21:09 — Monorepo Turbo criado com `apps/frontend` (Next.js 16, porta 3000), `apps/backend` (NestJS 12, porta 4000, CORS + `@nestjs/config`) e `.env`/`.env.example` nos dois apps, sob `@sdd`. Erros corrigidos: (1) o Nest CLI 12 gera o backend como ESM (`"type": "module"`), o que quebrava o build por causa dos imports relativos sem extensão gerados pelas skills; o backend voltou a ser CommonJS e os configs do vitest viraram `.mts`; (2) a troca de namespace não atualizava `@repo/*` em `packages/ui/tsconfig.json` e `eslint.config.mjs`; (3) o TypeScript 7.0.2 do template é incompatível com o `typescript-eslint` e foi fixado em 6.0.3 (raiz e `ui`); (4) o React 19.2.8 do `ui` foi alinhado ao 19.3.0 do frontend, o que deixou `next` ser elevado para a raiz e o `eslint-config-next` voltou a funcionar (reinstalação limpa); (5) `main.ts` passou a usar `void bootstrap()` por causa do oxlint. As correções 1, 2 e 5 foram levadas ao script da skill, com self-test cobrindo a correção 2.
- [x] Configurar a infraestrutura do Prisma no backend com a skill [config-prisma](../../../.claude/skills/config-prisma).
  > ✅ 2026-11-16 21:09 — `prisma.config.ts`, `prisma/schema.prisma` (modular), `prisma/models/bootstrap.model.prisma`, `prisma/seed/main.ts`, `docker-compose.yml` (porta 5907, nomes derivados do projeto), `DbModule` e `PrismaService` criados, e `DbModule` registrado no `AppModule`. `prisma:generate` OK. `db:start` validado depois, durante a spec 002: Postgres no ar na porta 5907 (Docker Desktop precisou ser aberto).
- [x] Criar o pacote compartilhado com a skill [config-package-shared](../../../.claude/skills/config-package-shared) usando o namespace `@sdd`.
  > ✅ 2026-11-16 21:09 — `packages/shared` (`@sdd/shared`) idêntico ao template da skill (db, error, model, usecase, validation). Build OK e 21 suítes / 96 testes passando.
- [x] Configurar a base de tratamento de erros e autenticação JWT no backend com a skill [backend-nest-config](../../../.claude/skills/backend-nest-config).
  > ✅ 2026-11-16 21:09 — `apps/backend/src/shared/` (auth, decorators, errors, types) aplicado com `@sdd/shared`, `AppModule` com `APP_FILTER` (`ApiExceptionFilter`) e `APP_GUARD` (`JwtAuthGuard`), `@Public()` no endpoint raiz, `JWT_SECRET`/`JWT_EXPIRES_IN` nos `.env`. Validação: `turbo run build lint check-types` com 7/7 tarefas OK, testes unitários e e2e do backend OK, e o backend no ar: `GET /` → "Hello World!" e uma rota inexistente → 404 no formato `ApiErrorResponse`.

## Resultado Esperado

- Monorepo funcional com `apps/backend` (NestJS, porta 4000) e `apps/frontend` (Next.js, porta 3000) sob o namespace `@sdd`.
- Prisma configurado com schema modular e infraestrutura (`DbModule`, `PrismaService`, seed técnico, docker compose) pronta para receber models de módulos.
- Pacote compartilhado disponível para backend, frontend e módulos de negócio.
- Backend com tratamento de erros centralizado e base de autenticação JWT prontos para serem consumidos por módulos futuros.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
