---
name: module-repository
description: Cria contratos de repositório padronizados para agregados dos módulos de negócio, reaproveitando interfaces compartilhadas de persistência e gerando também uma implementação em memória para apoiar testes dos casos de uso.
---

# Module Repository

Use esta skill quando o pedido for criar ou completar o contrato de repositorio de um agregado dentro de `modules/`, junto com uma implementacao fake/in-memory reutilizavel para testes de casos de uso.

Esta skill cobre somente:

- interface de repositorio no dominio
- tipos auxiliares minimos do contrato
- exports do agregado e do modulo de teste
- implementacao fake/in-memory simples e funcional

Esta skill nao cria:

- Prisma
- backend Nest
- controller
- migration
- seed
- adaptadores de infraestrutura real

## Entradas obrigatorias

1. `modulo` ou um `path` inequivoco dentro de `modules/<modulo>/`
2. `agregado` ou o `path` explicito do arquivo de repositorio de destino
3. `tipo de repositorio`
   - `crud`
   - `custom`
4. `entidade principal` manipulada pelo repositorio

## Entradas obrigatorias quando `tipo=custom`

5. lista de metodos desejados
6. assinatura esperada ou intencao de cada metodo quando houver ambiguidade relevante

Sem essas entradas, interrompa e peca somente os dados faltantes.

Perguntas objetivas permitidas:

- `Informe o modulo ou um path dentro de modules/.`
- `Informe o agregado ou o path explicito do repositorio.`
- `Deseja um repositorio "crud" ou "custom"?`
- `Qual entidade principal esse repositorio manipula?`
- `Liste os metodos customizados e a assinatura esperada de cada um.`

## Leituras obrigatorias

Antes de gerar qualquer arquivo, leia obrigatoriamente:

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

Depois disso, consulte tambem os materiais internos desta skill:

- `references/mandatory-readings.md`
- `references/repository-pattern.md`
- `references/few-shots/user.repository.example.ts`
- `references/few-shots/fake-user.repository.example.ts`

## Resolucao de destino

Aceite exatamente dois modos:

1. Por convencao:
   - `modules/<modulo>/src/<aggregate>/provider/<aggregate>.repository.ts`
2. Por path explicito informado pelo usuario

Regras:

- Validar que `modules/<modulo>` existe.
- Se o agregado vier por nome, validar que `modules/<modulo>/src/<aggregate>` existe ou que a estrutura minima do agregado ja foi criada.
- Se o usuario informar um path dentro do agregado, normalize para o arquivo alvo em `provider/<aggregate>.repository.ts` quando a intencao estiver clara.
- Se o destino for por convencao, o nome do arquivo deve ser sempre `<aggregate>.repository.ts` em `kebab-case`.
- O repositorio deve ficar dentro da pasta `provider`.
- Preserve convencoes locais ja existentes quando houver um path explicito valido.

## Arquivos que a skill deve criar ou atualizar

- `modules/<modulo>/src/<aggregate>/provider/<aggregate>.repository.ts`
- `modules/<modulo>/src/<aggregate>/provider/index.ts`
- `modules/<modulo>/src/<aggregate>/index.ts` quando necessario para expor `./provider`
- `modules/<modulo>/test/mock/fake-<aggregate>.repository.ts`
- `modules/<modulo>/test/mock/index.ts`

Preserve exports existentes. Nunca apague export valido para simplificar.

## Workflow

1. Validar entradas obrigatorias.
2. Resolver `modulo`, `aggregate` e o path final do repositorio.
3. Confirmar que o modulo existe e que o agregado e valido.
4. Ler as referencias obrigatorias do projeto e as referencias internas desta skill.
5. Ler os arquivos atuais do agregado:
   - `modules/<modulo>/src/<aggregate>/model/**`
   - `modules/<modulo>/src/<aggregate>/provider/index.ts`, se existir
   - `modules/<modulo>/src/<aggregate>/index.ts`, se existir
   - `modules/<modulo>/test/mock/index.ts`, se existir
6. Descobrir os nomes reais ja usados para entidade, tipos auxiliares e exports.
7. Gerar a interface do repositorio seguindo as regras abaixo.
8. Gerar a fake/in-memory implementando o contrato recem-criado.
9. Atualizar os `index.ts` necessarios sem perder exports existentes.
10. Reportar o que foi criado ou ajustado e qualquer placeholder introduzido.

## Regras da interface

- O contrato deve seguir o padrao `export interface <EntityName>Repository`.
- Reaproveite contratos de `@<scope>/shared` sempre que houver encaixe claro.
- Evite reescrever assinaturas que ja existem em `CreateRepository`, `UpdateRepository`, `DeleteRepository`, `FindByIdRepository`, `FindPageRepository` ou `CrudRepository`.
- Use os tipos reais da entidade e dos parametros relacionados ao agregado quando existirem.
- Se tipos auxiliares ainda nao existirem e nao der para inferir com seguranca, crie placeholders tipados, pequenos e didaticos no proprio arquivo do repositorio.
- Nao invente regras de negocio nem campos detalhados de dominio.
- O arquivo deve ser estrutural: contrato e tipos minimos, sem infraestrutura real.

### Quando `tipo=crud`

Prefira:

```ts
export interface <EntityName>Repository extends CrudRepository<
  <CreateInput>,
  <UpdateInput>,
  <EntityName>,
  <PageParams>,
  <IdType>
> {}
```

Regras:

- Peca ou infira com seguranca:
  - entidade principal
  - tipo de entrada de criacao
  - tipo de entrada de atualizacao
  - tipo de parametros de paginacao, quando houver `findPage`
- Se nao for possivel inferir com seguranca, crie placeholders como:
  - `<EntityName>CreateInput`
  - `<EntityName>UpdateInput`
  - `<EntityName>PageParams`
- Prefira um contrato enxuto e facil de evoluir.
- Se o repositorio nao precisar de `findPage`, nao force `CrudRepository`; componha interfaces granulares quando isso deixar o contrato mais fiel ao pedido.

### Quando `tipo=custom`

Regras:

- Exija a lista de metodos desejados.
- Crie cada metodo com nome, parametros e retorno coerentes com a intencao informada.
- Se houver ambiguidade relevante sobre parametros ou retorno, interrompa e peca esclarecimento antes de inventar uma assinatura.
- Se um metodo descrito pelo usuario corresponder claramente a `create`, `update`, `delete`, `findById` ou `findPage`, prefira compor a interface com os contratos compartilhados em vez de duplicar assinatura manual.
- Quando fizer sentido, combine contratos compartilhados com metodos adicionais no mesmo `interface`.

## Regras da fake/in-memory

- Sempre gere tambem uma fake/in-memory.
- A fake nao usa framework de mock.
- A fake deve ser uma classe simples, concreta e funcional.
- O objetivo e suportar testes reais de casos de uso sem backend.
- O destino preferencial e `modules/<modulo>/test/mock/fake-<aggregate>.repository.ts`.
- Se o modulo ja tiver uma convencao de testes mais especifica, preserve-a.
- A classe fake deve implementar a interface do repositorio recem-criada.
- Priorize `Map`, `Array` ou combinacao simples das duas para armazenamento.
- Priorize clareza e previsibilidade, nao realismo de infraestrutura.

### Fake para `crud`

- Implemente comportamento funcional para os metodos do contrato.
- Para `create`, persista em memoria e retorne a entidade salva.
- Para `update`, substitua o item existente e falhe de forma simples quando o registro nao existir.
- Para `delete`, remova o item em memoria.
- Para `findById`, retorne a entidade ou `null`.
- Para `findPage`, monte um `PageResult<TEntity>` simples, coerente com o padrao do projeto.
- Use `entity.id` como chave quando o id for string, seguindo o padrao atual do projeto.

### Fake para `custom`

- Implemente versoes simples e coerentes dos metodos definidos.
- Se o metodo representar busca, filtre os dados em memoria.
- Se o metodo representar comando, atualize o armazenamento e retorne o minimo necessario para testes.
- Nao simule integracoes externas nem dependencias de framework.

## Convencoes de import e export

- Reaproveite o namespace compartilhado exposto pelo projeto, por exemplo `@<scope>/shared`.
- No repositorio de dominio, prefira importar a entidade a partir de `../model`.
- Na fake, prefira importar contrato, entidade e tipos do proprio modulo a partir de `../../src` quando essa convencao local existir.
- Atualize `provider/index.ts` com `export * from "./<aggregate>.repository";`
- Garanta que `src/<aggregate>/index.ts` exponha `./provider` quando necessario.
- Atualize `test/mock/index.ts` com `export * from "./fake-<aggregate>.repository";`

## Guardrails

- Nao prosseguir sem modulo, agregado e tipo claramente definidos.
- Nao assumir que todo repositorio e CRUD.
- Nao criar implementacao Prisma, backend ou qualquer persistencia real.
- Nao editar arquivos fora do modulo alvo, exceto a propria skill quando estiver sendo criada ou atualizada.
- Nao duplicar contratos que ja existem em `packages/shared`.
- Nao criar assinaturas arbitrarias quando houver ambiguidade relevante.
- Nao remover exports existentes.
- Nao introduzir dependencias de framework na fake.

## Saida esperada

- Interface de repositorio coerente com o agregado
- Tipos auxiliares minimos quando necessarios
- Fake/in-memory funcional para testes futuros
- Exports do agregado e de `test/mock` atualizados

Consulte `references/mandatory-readings.md` para o checklist de leitura e `references/repository-pattern.md` para o padrao observado no projeto.
