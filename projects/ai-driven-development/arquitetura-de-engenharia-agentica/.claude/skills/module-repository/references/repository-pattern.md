# Repository Pattern

Padrao observado no projeto:

- O contrato do repositorio fica em `modules/<modulo>/src/<aggregate>/provider/<aggregate>.repository.ts`
- O arquivo `provider/index.ts` reexporta o contrato
- O agregado expoe `model`, `provider` e `usecase` por meio de `src/<aggregate>/index.ts`
- O repositorio de dominio usa import de `@<scope>/shared`
- A entidade do agregado vem de `../model`
- O teste usa fake em `modules/<modulo>/test/mock/fake-<aggregate>.repository.ts`
- A fake importa tipos do modulo via `../../src` quando isso simplifica o consumo

Padrao CRUD minimo observado em `auth`:

```ts
import { CrudRepository } from "@<scope>/shared";
import { User } from "../model";

export interface UserPageParams {
  page: number;
  perPage: number;
}

export interface UserRepository extends CrudRepository<
  User,
  User,
  User,
  UserPageParams
> {}
```

Padrao da fake observado em `auth`:

- usa `Map<string, Entity>` para storage
- aceita dados iniciais no construtor
- expoe leitura da colecao em memoria
- implementa `findPage` retornando `PageResult<TEntity>`
- falha no `update` quando o registro nao existe

Heuristicas seguras:

- Se a entidade ja representa o payload de criacao e atualizacao, reutilize a propria entidade como generic de `CrudRepository`.
- Se nao for seguro reutilizar a entidade, crie tipos auxiliares locais pequenos e explicitos.
- Se o pedido mencionar somente parte das operacoes CRUD, prefira composicao com contratos granulares em vez de `CrudRepository`.
- Em repositorios customizados, evite declarar manualmente um metodo que ja encaixa em contrato compartilhado.
