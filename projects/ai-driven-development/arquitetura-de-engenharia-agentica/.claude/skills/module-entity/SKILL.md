---
name: module-entity
description: Cria entidades de domínio padronizadas para os módulos da aplicação, com estado tipado, herança da entidade base, validação explícita orientada por regras reutilizáveis do projeto e testes unitários completos para garantir segurança de evolução.
---

# Module Entity

Use esta skill quando o pedido for criar ou completar uma entidade de dominio dentro de um modulo existente em `modules/`, junto com o teste unitario da entidade e a verificacao de coverage.

Esta skill nao cria controller, repositorio Prisma, migration, seed ou adaptacoes do backend. O foco aqui e somente:

- entidade de dominio
- validacao explicita e lazy
- reaproveitamento de regras compartilhadas
- testes unitarios fortes
- coverage de 100% para a entidade criada ou alterada

## Entradas obrigatorias

1. `nome do modulo`
2. `nome do agregado` ou `path do agregado`
3. `nome da entidade`
4. `lista de atributos com tipos`

Entrada opcional:

5. `regras explicitas por campo`, quando o usuario quiser forcar alguma validacao

## Referencias obrigatorias

Antes de gerar qualquer codigo, ler obrigatoriamente:

1. `modules/auth/src/user/model/user.entity.ts`
2. `modules/auth/test/user/model/user.entity.test.ts`
3. `packages/shared/src/validation/rules/`
4. `packages/shared/src/validation/index.ts`
5. `packages/shared/src/validation/validator.ts`
6. `packages/shared/src/model/entity.ts`

Tambem leia as referencias internas desta skill para acelerar a reproducao estrutural:

- `references/user-entity-pattern.md`
- `references/validation-inference-guide.md`

## Validacoes iniciais

1. Validar que `modules/<modulo>` existe.
2. Resolver o agregado:
   - Se o usuario informar apenas o nome, usar `modules/<modulo>/src/<aggregate>`.
   - Se o usuario informar um path, ele deve apontar para um agregado real dentro de `modules/<modulo>/src/`.
3. Se o path informado apontar para `model/` ou para um arquivo dentro do agregado, normalizar para a pasta do agregado.
4. Se o agregado nao existir, parar e pedir o agregado correto.
5. Nao inferir multiplos destinos. Se houver ambiguidade real entre dois caminhos validos, parar e pedir confirmacao.
6. Ler `modules/<modulo>/package.json` para descobrir o nome real do workspace antes de rodar os testes.

## Destinos obrigatorios

- Entidade:
  - `modules/<modulo>/src/<aggregate>/model/<entity>.entity.ts`
- Teste:
  - `modules/<modulo>/test/<aggregate>/model/<entity>.entity.test.ts`

Convencoes obrigatorias:

- Nome do arquivo em `kebab-case`
- Interface de estado em `PascalCase` com sufixo `State`
- Classe em `PascalCase`

Exemplo:

- arquivo: `customer.entity.ts`
- interface: `CustomerState`
- classe: `Customer`

## Estrutura obrigatoria da entidade

Seguir exatamente o padrao do projeto:

1. `export interface <EntityName>State extends EntityState`
2. `export class <EntityName> extends Entity<<EntityName>State>`
3. Construtor apenas repassa `props` para `super(props)`
4. Getters explicitos para todos os campos informados
5. `validate()` com `Validator.validate([...])`

Formato esperado:

```ts
export interface ExampleEntityState extends EntityState {
  field: string;
}

export class ExampleEntity extends Entity<ExampleEntityState> {
  constructor(props: ExampleEntityState) {
    super(props);
  }

  get field(): string {
    return this.props.field;
  }

  public validate(): void {
    Validator.validate([
      {
        code: "exampleEntity.field",
        value: this.field,
        rules: [new RequiredRule()],
      },
    ]);
  }
}
```

## Regra central de validacao

- Nao fazer validacao eager no construtor.
- Nao chamar `validate()` dentro do construtor.
- A entidade pode existir temporariamente invalida.
- Isso e intencional e obrigatorio.
- A unica validacao automatica aceita e a da classe base `Entity`, que valida `id` e timestamps.
- Toda regra de negocio da propria entidade deve ficar dentro de `validate()`.

## Heuristica de inferencia de validacao

A skill deve inferir o melhor conjunto possivel de regras com base em:

- nome do campo
- tipo do campo
- padrao observado nas regras existentes
- exemplo real em `User`
- regras explicitas fornecidas pelo usuario

Prioridades:

1. Regra explicita do usuario
2. Regra compartilhada ja existente em `packages/shared/src/validation/rules`
3. Nova regra compartilhada, somente se ela for claramente generica e reutilizavel

Nunca:

- deixar campo relevante sem protecao por omissao
- criar regra local dentro da entidade quando ja existir regra compartilhada adequada
- criar regra compartilhada para comportamento hiper especifico de uma unica entidade

### Regras sugeridas por tipo e semantica

Use as regras compartilhadas existentes sempre que fizer sentido:

- `string` obrigatoria:
  - `RequiredRule`
- nomes pessoais:
  - `RequiredRule`
  - `MinLengthRule`
  - `MaxLengthRule`
  - `PersonNameRule`
- email:
  - `RequiredRule`
  - `EmailRule`
- slug:
  - `RequiredRule`
  - `SlugRule`
- url:
  - `RequiredRule`
  - `UrlRule`
- dominio:
  - `RequiredRule`
  - `DomainRule`
- senha em hash:
  - `BcryptHashRule`
- senha em texto puro:
  - `RequiredRule`
  - `StrongPasswordRule`
  - `NoCommonPasswordRule`
- UUID em campo de referencia:
  - `RequiredRule`
  - `UuidRule`
- numero inteiro:
  - `RequiredRule`
  - `IntegerRule`
- numero positivo:
  - `PositiveRule`
- numero negativo:
  - `NegativeRule`
- limite numerico:
  - `MinValueRule`
  - `MaxValueRule`
  - `RangeValueRule`
- `Date`:
  - `RequiredRule`
  - `DateRule`
- data passada ou futura:
  - `PastDateRule`
  - `FutureDateRule`
- arrays:
  - `RequiredRule` quando o campo nao puder faltar
  - `MinItemsRule`
  - `MaxItemsRule`
  - `UniqueItemsRule`
- strings sem espacos ou com formato especial:
  - `NoWhitespaceRule`
  - `RegexRule`
  - `AlphaRule`
  - `AlphaNumericRule`
  - `StartsWithRule`
  - `EndsWithRule`
  - `ContainsRule`

### Convencao de codigos de erro

- Usar prefixo semanticamente estavel em minusculo.
- Seguir o padrao observado em `user.entity.ts`.
- Preferir `<aggregate>.<campo>` quando a entidade representar o agregado principal.
- Para entidades filhas, usar um prefixo claro e consistente, por exemplo `<entity>.<campo>`.
- Manter o mesmo prefixo em todos os campos da entidade.

## Criacao de nova regra compartilhada

Se nao existir regra compartilhada suficiente para um caso recorrente e generico:

1. Criar a nova regra em `packages/shared/src/validation/rules/<rule>.rule.ts`
2. Exportar em `packages/shared/src/validation/rules/index.ts`
3. Confirmar que `packages/shared/src/validation/index.ts` ja a expoe via `export * from "./rules"`
4. Criar ou atualizar o teste da nova regra em `packages/shared/test/validation/rules/`
5. Usar a regra nova na entidade

Essa regra nova so deve existir quando o comportamento for claramente reaproveitavel por outros modulos.

## Atualizacao de barrels

Para reduzir ajuste manual posterior, manter os exports coerentes com o padrao local:

1. Se existir `modules/<modulo>/src/<aggregate>/model/index.ts`, exportar a nova entidade nele.
2. Se nao existir esse arquivo e o agregado ja possuir outras entidades ou model, criar `model/index.ts`.
3. Se `modules/<modulo>/src/index.ts` ja exportar `./<aggregate>/model`, preservar o padrao.
4. Se o modulo usar um barrel mais amplo por agregado, atualizar somente o minimo necessario para a entidade ficar acessivel pelo padrao ja adotado no proprio modulo.

Nao inventar reorganizacao estrutural.

## Regras dos testes unitarios

O teste da entidade deve buscar cobertura de 100% para o arquivo da entidade.

Cobertura minima obrigatoria:

1. criacao de entidade valida
2. leitura correta de todos os getters
3. comportamento lazy, garantindo que a entidade possa existir invalida antes do `validate()`
4. sucesso de `validate()` para dados validos
5. falha de `validate()` para dados invalidos
6. mensagens ou codigos de erro esperados quando fizer sentido
7. cenarios limite das regras aplicadas
8. comportamento herdado relevante da classe base, quando fizer parte da superficie observavel
9. branches internos de `validate()`
10. fluxos de `clone`, `deletedAt`, `createdAt` e `updatedAt`, quando a entidade os expuser de forma observavel

Regras de qualidade do teste:

- seguir o estilo de `modules/auth/test/user/model/user.entity.test.ts`
- criar helper para extrair mensagens de `ValidationException` quando isso simplificar assercoes
- evitar teste superficial que apenas instancia a classe sem verificar comportamento
- testar especialmente as combinacoes que podem deixar branch sem cobertura
- se a entidade tiver apenas getters e um `validate()` linear, ainda assim cobrir sucesso, falha e limites de cada regra importante

## Workflow recomendado

1. Validar modulo, agregado e destino.
2. Ler as referencias obrigatorias.
3. Identificar regras compartilhadas ja existentes para cada campo.
4. Decidir o prefixo dos codigos de validacao.
5. Criar ou atualizar a entidade.
6. Criar ou atualizar o teste da entidade.
7. Atualizar barrels minimos do agregado, se necessario.
8. Se houver nova regra compartilhada, criar a regra e o teste dela antes de validar a entidade.
9. Rodar testes com coverage mirando a entidade.
10. Se coverage da entidade ficar abaixo de 100%, ajustar os testes e rodar novamente.

## Comandos de verificacao

Preferir executar a partir da raiz do projeto.

Para o modulo afetado:

```bash
npm run test --workspace <workspace-name-lido-do-package-json> -- --runTestsByPath test/<aggregate>/model/<entity>.entity.test.ts --collectCoverageFrom=src/<aggregate>/model/<entity>.entity.ts
```

Se a implementacao criar nova regra compartilhada:

```bash
npm run test --workspace <workspace-name-do-shared> -- --runTestsByPath test/validation/rules/<rule>.test.ts --collectCoverageFrom=src/validation/rules/<rule>.rule.ts
```

Quando fizer sentido, rodar tambem a suite completa do modulo:

```bash
npm run test --workspace @<scope>/<modulo>
```

Objetivo obrigatorio:

- cobertura de 100% para a entidade criada ou alterada
- quando houver nova regra compartilhada, cobertura de 100% tambem para essa regra

## Guardrails

- Nao criar controller, repository, migration, seed ou adaptacoes de backend.
- Nao mudar o padrao da entidade base do projeto.
- Nao colocar logica de negocio fora de `validate()` sem necessidade estrutural real.
- Nao disparar `validate()` no construtor.
- Nao ignorar `clone`, timestamps ou `deletedAt` quando eles forem relevantes para a superficie observavel.
- Nao usar regra ad hoc local se existe regra compartilhada equivalente.
- Nao parar cedo com coverage parcial; ajustar os testes ate cobrir completamente a entidade.

## Saida esperada

- entidade criada ou atualizada em `modules/<modulo>/src/<aggregate>/model/<entity>.entity.ts`
- teste criado ou atualizado em `modules/<modulo>/test/<aggregate>/model/<entity>.entity.test.ts`
- barrels minimos ajustados quando necessario
- nova regra compartilhada criada apenas se realmente generica
- validacao final executada com coverage

## Few-shot

Para reproduzir o padrao estrutural rapidamente:

- ver `references/user-entity-pattern.md`
- ver `references/validation-inference-guide.md`
