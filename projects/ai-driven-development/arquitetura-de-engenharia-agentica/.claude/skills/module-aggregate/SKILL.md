---
name: module-aggregate
description: Cria a estrutura padronizada de um agregado dentro de um módulo de negócio, organizando pastas, arquivos-base e nomenclaturas de model, provider e usecase para acelerar a evolução consistente do projeto.
---

# Module Aggregate

Use o script `scripts/create-aggregate.js` para criar de forma deterministica a estrutura base de um agregado dentro de um modulo existente em `modules/<modulo>`.

## Entradas obrigatorias

1. `nome do modulo`, correspondente a uma pasta ja existente em `modules/<modulo>`.
2. `nome do agregado`.

## Entrada opcional, mas recomendada

3. `tipo de estrutura inicial dos casos de uso`:
   - `crud`
   - `example`

Se o pedido nao informar essa terceira entrada, interrompa e pergunte de forma objetiva:

`Deseja criar a base de usecases em "crud" ou "example"?`

Sem essa resposta, nao executar a skill.

## Fluxo

1. Validar que o pedido informa explicitamente o modulo e o agregado.
2. Validar que `modules/<modulo>` ja existe e contem `src/index.ts`.
3. Normalizar o nome do agregado para `kebab-case` em pastas e arquivos.
4. Se `mode` nao vier no pedido, fazer a pergunta objetiva acima e aguardar.
5. Executar a partir da raiz do projeto:

```bash
node "$(find . -maxdepth 6 -path "*/module-aggregate/scripts/create-aggregate.js" ! -path "*/node_modules/*" | head -1)" --module auth --aggregate user-profile --mode crud
```

6. Verificar ao final:
   - `modules/<modulo>/src/<aggregate>/model/<aggregate>.entity.ts`
   - `modules/<modulo>/src/<aggregate>/provider/<aggregate>.repository.ts`
   - `modules/<modulo>/src/<aggregate>/usecase/index.ts`
   - `modules/<modulo>/src/<aggregate>/index.ts`
   - `modules/<modulo>/src/index.ts` exportando `./<aggregate>` sem remover exports existentes

## O que a skill cria

- Estrutura do agregado em `modules/<modulo>/src/<aggregate>/`
- Pastas `model`, `provider` e `usecase`
- Entidade base com `Entity` e `EntityState`
- Contrato inicial de repositorio com `CrudRepository`
- Arquivos `index.ts` necessarios para exportar o agregado
- Casos de uso minimos conforme o modo solicitado

## Modos de usecase

### `crud`

Cria a base padronizada:

- `create-<aggregate>.usecase.ts`
- `update-<aggregate>.usecase.ts`
- `delete-<aggregate>.usecase.ts`
- `find-<aggregate>-by-id.usecase.ts`
- `find-<aggregate>-page.usecase.ts`

### `example`

Cria apenas um caso de uso minimo e generico para demonstrar a estrutura:

- `create-<aggregate>.usecase.ts`

## Convencoes obrigatorias

- Nao implementar regras reais de negocio.
- Nao inventar atributos especificos do agregado.
- Nao assumir uma abordagem opinativa de DDD alem da organizacao por agregado ja usada no projeto.
- Nao criar controller, adapter, implementacao Prisma, migration ou qualquer infraestrutura adicional.
- Preservar exports existentes em `modules/<modulo>/src/index.ts`.
- Usar apenas recursos contidos nesta skill (scripts, templates e references do diretório desta skill).

## Recursos internos

- `scripts/create-aggregate.js`: materializa a estrutura do agregado.
- `assets/common/`: templates base de `model`, `provider` e `index.ts`.
- `assets/usecase/crud/`: templates dos casos de uso CRUD.
- `assets/usecase/example/`: template do caso de uso minimo de exemplo.

## Guardrails

- Nao executar quando o modulo informado nao existir.
- Nao executar quando o agregado ja existir.
- Nao inferir o modo `crud` ou `example` quando ele nao vier no pedido.
- Nao editar arquivos fora de `modules/<modulo>/src/**`, exceto a propria skill.
- Nao adicionar documentacao extra fora dos arquivos da skill.
