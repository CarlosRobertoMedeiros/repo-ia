# Mandatory Readings

Leia estes arquivos exatamente nesta ordem antes de gerar o repositorio:

1. `packages/shared/src/db/create.repository.ts`
2. `packages/shared/src/db/update.repository.ts`
3. `packages/shared/src/db/delete.repository.ts`
4. `packages/shared/src/db/find-by-id.repository.ts`
5. `packages/shared/src/db/find-page.repository.ts`
6. `packages/shared/src/db/crud.repository.ts`
7. `packages/shared/src/db/index.ts`
8. `modules/auth/src/user/provider/user.repository.ts`
9. `modules/auth/src/user/model/user.entity.ts`
10. `modules/auth/test/mock/fake-user.repository.ts`

Extraia dessas leituras:

- quais contratos genericos ja existem no `shared`
- como o projeto importa esses contratos
- como o agregado expoe entidade e repositorio
- como a fake usa `Map`, `PageResult` e imports do proprio modulo
- qual convencao de nome o projeto usa para `PageParams`, `Repository` e `Fake...Repository`

Antes de editar arquivos do modulo alvo, confira tambem:

- `modules/<modulo>/src/<aggregate>/provider/index.ts`, se existir
- `modules/<modulo>/src/<aggregate>/index.ts`, se existir
- `modules/<modulo>/test/mock/index.ts`, se existir

Se qualquer leitura obrigatoria falhar, pare e relate claramente o bloqueio.
