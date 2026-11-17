# 002-cadastro-cliente

## Objetivo

Entregar o cadastro de usuário no módulo `auth`, com entidade, caso de uso `register-user`, persistência via Prisma e endpoint HTTP protegido por criptografia de senha com bcrypt.

## Contexto Técnico

- Módulo de negócio novo: `auth`, com agregado `user`.
- Persistência via Prisma; criptografia de senha via biblioteca `bcrypt`.
- Endpoint de registro exposto no backend via controller simples que instancia o caso de uso no corpo do método.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- As interfaces definidas no módulo `auth` (repositório de `user` e `crypto.provider.ts`) não podem ser alteradas pelas implementações.
- As implementações técnicas (repositório Prisma e provider bcrypt) devem ficar diretamente em `apps/backend/src/modules/auth`, sem subpasta.
- No `auth.controller.ts`, o caso de uso `register-user` deve ser instanciado no corpo do método, recebendo as implementações injetadas no próprio controller como parâmetro.

## Tasks

### Tasks - Módulo auth

- [x] Criar o módulo `auth` com a skill [config-new-module](../../../.claude/skills/config-new-module).
  > ✅ 2026-11-16 21:22 — Módulo `@sdd/auth` criado em `modules/auth` (namespace `@sdd`, o mesmo do workspace), com módulo/controller Nest em `apps/backend/src/modules/auth`, estrutura no frontend e `AuthModule` registrado no `AppModule`. Evidências antigas desta task (2026-04-24, `@cadastro-base`) não correspondiam ao repositório — não havia `modules/` — e foram substituídas. Corrigidos 3 bugs do script da skill: o `spawnSync npm` falhava no Windows (ENOENT), o registro no `AppModule` era pulado porque `JwtAuthModule` contém "AuthModule", e o template do `package.json` deixava o nome `@sdd/__package_name__`. Build do monorepo e teste do workspace passaram.

- [x] Criar o agregado `user` dentro do módulo `auth` com a skill [module-aggregate](../../../.claude/skills/module-aggregate), contendo apenas um caso de uso de exemplo.
  > ✅ 2026-11-16 21:22 — Agregado `user` criado em `modules/auth/src/user/` (`model`, `provider`, `usecase`) no modo `example`, com apenas `create-user.usecase.ts`. Exportado em `modules/auth/src/index.ts`.

- [x] Implementar a entidade `user` com a skill [module-entity](../../../.claude/skills/module-entity), com os campos `id`, `name` (rule: person name), `email` (rule: email) e `password` (rule: hash pass).
  > ✅ 2026-11-16 21:22 — Entidade `User`/`UserState` em `modules/auth/src/user/model/user.entity.ts`: `name` (Required, MinLength 3, MaxLength 80, PersonName), `email` (Required, Email), `password` (BcryptHash); validação lazy via `validate()`. Teste com 18 casos em `test/user/model/user.entity.test.ts` e cobertura de 100%.

- [x] Criar a interface `crypto.provider.ts` em `modules/auth/.../user/provider` com os métodos de criptografar senha e comparar senhas.
  > ✅ 2026-11-16 21:22 — Interface `CryptoProvider` em `modules/auth/src/user/provider/crypto.provider.ts` com `encrypt(password)` e `compare(password, hashedPassword)` (nomes alinhados aos few-shots das skills de backend). Exportada em `provider/index.ts`. A spec não fixa os nomes dos métodos.

- [x] Implementar o caso de uso `register-user` com a skill [module-use-case](../../../.claude/skills/module-use-case), cobrindo o fluxo: validar dados de entrada (`name`, `email`, `password`), validar se o usuário já está cadastrado, criptografar a senha, criar a entidade `user` e persistir via repositório. O retorno do caso de uso deve ser `void`.
  > ✅ 2026-11-16 21:22 — `RegisterUser` em `modules/auth/src/user/usecase/register-user.usecase.ts`, retorno `void`. Fluxo: valida `name`/`email`/`password` (StrongPasswordRule) → normaliza e-mail (trim + minúsculas) e busca por `findByEmail` → `DomainError` 409 se já existir → `encrypt` → cria `User` → `validate()` → `create`. `UserRepository` ganhou `findByEmail`; fakes `FakeUserRepository` e `FakeCryptoProvider` em `test/mock/`. 9 casos de teste, 100% de cobertura do arquivo (27 testes no módulo).

### Tasks - Back-end

- [x] Sincronizar o módulo `auth` com o Prisma criando o model da entidade `user` com a skill [backend-prisma-sync-module](../../../.claude/skills/backend-prisma-sync-module).
  > ✅ 2026-11-16 21:22 — Model `User` (`@@map("users")`, `email` único, `deletedAt` opcional) em `apps/backend/prisma/models/auth.model.prisma`; `bootstrap.model.prisma` removido. Migration `20261117001921_auth` aplicada no Postgres do Docker (porta 5907) e client gerado. Docker Desktop precisou ser aberto manualmente para isso; `db:start` também ficou validado (pendência da spec 001).

- [x] Implementar o repositório Prisma de `user` diretamente em `apps/backend/src/modules/auth` (sem subpasta) com a skill [backend-prisma-repository](../../../.claude/skills/backend-prisma-repository), sem alterar a interface definida no módulo `auth`.
  > ✅ 2026-11-16 21:22 — `PrismaUserRepository` em `apps/backend/src/modules/auth/user.prisma.ts` (sem subpasta), implementando `create`, `update`, `delete`, `findById`, `findByEmail` e `findPage` com `PrismaService`, sem alterar a interface do módulo. `AuthModule` importa `DbModule` e registra/exporta a classe.

- [x] Instalar `bcrypt` no backend e implementar `crypto.provider.ts` diretamente em `apps/backend/src/modules/auth` (sem subpasta) usando bcrypt, sem alterar a interface definida no módulo `auth`.
  > ✅ 2026-11-16 21:22 — `bcrypt@^6` e `@types/bcrypt` instalados em `@sdd/backend`. `BcryptCryptoProvider` em `apps/backend/src/modules/auth/crypto.provider.ts` (sem subpasta, 10 salt rounds), sem alterar a interface; registrado em `AuthModule`.

- [x] Criar `auth.controller.ts` no backend com a skill [backend-nest-controller](../../../.claude/skills/backend-nest-controller) expondo o endpoint de registrar usuário: injetar repositório e `crypto.provider` diretamente no controller, instanciar o caso de uso `register-user` no corpo do método e passar as dependências via parâmetro.
  > ✅ 2026-11-16 21:22 — `AuthController` com `POST /auth/register` (`@Public()`, 201). Repositório e `crypto.provider` injetados no construtor; `RegisterUser` instanciado no corpo do método. `turbo run build lint check-types` com 8/8 tarefas OK.

- [x] Criar os testes de integração HTTP em `auth.integration.http` (Rest Client) cobrindo o fluxo de registro de usuário.
  > ✅ 2026-11-16 21:22 — `apps/backend/src/modules/auth/auth.integration.http` com 6 cenários (válido, e-mail duplicado, nome inválido, e-mail inválido, senha fraca, campos ausentes), usando `{{$timestamp}}` para e-mails únicos. Executados via `curl` contra o backend real: 201; 409 (também com e-mail em caixa alta); 422 com os códigos esperados em todos os demais. No banco, a senha ficou como hash bcrypt (`$2b$10$`, 60 caracteres). Linha de teste removida de `users` ao final. Desvio: executado por `curl`, não pela extensão Rest Client.

## Resultado Esperado

- Módulo `auth` com agregado `user`, entidade validada e caso de uso `register-user` implementado e testado.
- Model `user` sincronizado no Prisma com migration aplicada.
- Endpoint de cadastro de usuário exposto no backend, com senha armazenada criptografada via bcrypt.
- Testes de integração em `auth.integration.http` executando com sucesso.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
