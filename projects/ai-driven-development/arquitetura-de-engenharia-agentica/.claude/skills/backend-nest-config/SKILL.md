---
name: backend-nest-config
description: Configura a base compartilhada do backend NestJS com tratamento centralizado de erros, autenticacao por JWT, decorators utilitarios e infraestrutura comum para endpoints protegidos da aplicacao.
---

# Backend Nest Config

## Objetivo

Aplicar de forma determinística a camada compartilhada do backend NestJS em `apps/backend/src/shared/`, registrar o filtro global de erros e o guard global de JWT no `AppModule`, instalar as dependências necessárias e ajustar `.env` / `.env.example`.

A estrutura gerada é espelho fiel de `assets/shared-template/` e dos templates de `assets/app-module*.template.ts` / `assets/app-controller.template.ts`.

## Workflow

Sempre executar a partir da raiz do monorepo:

```bash
node .claude/skills/backend-nest-config/scripts/apply-backend-shared.js
```

Opcional:

- `--force`: sobrescreve `app.module.ts` e `app.controller.ts` mesmo quando eles parecerem customizados. Sem esse flag, o script faz fallback seguro e pula com aviso `[RISK]`.

## O que o script faz (determinístico)

1. Valida que `apps/backend/package.json` e `apps/backend/src/app.module.ts` existem.
2. Detecta o scope npm (`@<scope>`) a partir do `package.json` raiz (fallback: `apps/backend/package.json`).
3. Instala no workspace `apps/backend` as dependências que estiverem faltando:
   - runtime: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@<scope>/shared`.
   - dev: `@types/passport-jwt`.
   - dependências já presentes são preservadas (sem upgrade forçado).
4. Copia `assets/shared-template/**` para `apps/backend/src/shared/`, substituindo o placeholder `__SCOPE__` pelo scope detectado. Estrutura resultante:

```text
apps/backend/src/shared/
  auth/
    auth-user.mapper.ts
    index.ts
    jwt-auth.guard.ts
    jwt-auth.module.ts
    jwt.strategy.ts
  decorators/
    current-user.decorator.ts
    index.ts
    public.decorator.ts
  errors/
    api-exception.filter.ts
    error-response.type.ts
    index.ts
  types/
    authenticated-request.type.ts
    current-user.type.ts
    index.ts
    jwt-payload.type.ts
  index.ts
```

5. Reescreve `apps/backend/src/app.module.ts` a partir de `assets/app-module.template.ts` (quando há `src/db/db.module.ts`) ou `assets/app-module-no-db.template.ts` (quando não há). Registra:
   - `ConfigModule.forRoot({ isGlobal: true })`
   - `JwtAuthModule`
   - `{ provide: APP_FILTER, useClass: ApiExceptionFilter }`
   - `{ provide: APP_GUARD, useClass: JwtAuthGuard }`
   - `DbModule` quando presente.
6. Reescreve `apps/backend/src/app.controller.ts` a partir de `assets/app-controller.template.ts`, anotando o endpoint raiz com `@Public()`.
7. Adiciona `JWT_SECRET` e `JWT_EXPIRES_IN` em `apps/backend/.env` e `apps/backend/.env.example` somente se ausentes (não sobrescreve valores existentes).
8. Executa `npm --workspace apps/backend run build` para validar a integração.

## Guardas de segurança

- Se `app.module.ts` já contiver `APP_FILTER`, `APP_GUARD`, `JwtAuthModule` e `ApiExceptionFilter`, o script pula a reescrita (`[SKIP]`).
- Se `app.module.ts` parecer customizado (muito grande ou sem `AppController`/`AppService`), o script loga `[RISK]` e pula a reescrita. Use `--force` para sobrescrever conscientemente.
- Se `app.controller.ts` não for o scaffold padrão do Nest (com `getHello`), o script pula a reescrita com `[RISK]` a menos que `--force` seja passado.
- `.env` é tratado de forma aditiva: chaves já existentes não são alteradas.
- `apps/backend/src/shared/` é reescrito integralmente a cada execução — essa é a parte totalmente determinística da skill. Edits manuais dentro dessa pasta serão perdidos no próximo apply. Customizações devem viver fora dela.

## Dependências entre skills

A skill assume que o monorepo já foi inicializado por `config-project-fullstack` (que também já adiciona `@nestjs/config`). O pacote `@<scope>/shared` precisa existir (criado por `config-package-shared`) porque `errors/api-exception.filter.ts` importa `DomainError`, `ValidationError` e `ValidationException` dele.

Não é necessário pré-instalar nada manualmente — o script resolve via `npm install --workspace apps/backend`.

## Saída esperada

- Camada compartilhada em `apps/backend/src/shared/` pronta para uso por qualquer módulo.
- Filtro global `ApiExceptionFilter` normalizando toda resposta de erro da API para o shape `ApiErrorResponse` (`statusCode`, `errors: string[]`, `message?`, `details?`, `path?`, `timestamp`), compatível com `ValidationException` de múltiplos códigos.
- `JwtAuthGuard` aplicado globalmente; rotas abertas usam `@Public()`.
- `@CurrentUser()` disponível para controllers protegidos.
- Build do backend validado ao final da execução.

## Manutenção da skill

Para atualizar a estrutura gerada:

1. Editar o projeto real em `apps/backend/src/shared/`, `apps/backend/src/app.module.ts` e/ou `apps/backend/src/app.controller.ts`.
2. Copiar de volta para os templates:
   - `cp -r apps/backend/src/shared/* .claude/skills/backend-nest-config/assets/shared-template/`
   - `cp apps/backend/src/app.module.ts .claude/skills/backend-nest-config/assets/app-module.template.ts`
   - `cp apps/backend/src/app.controller.ts .claude/skills/backend-nest-config/assets/app-controller.template.ts`
3. Trocar referências a `@<scope>/shared` por `__SCOPE__/shared` nos assets copiados (hoje só em `errors/api-exception.filter.ts`).
4. Atualizar `assets/app-module-no-db.template.ts` quando a variante sem Prisma mudar.
