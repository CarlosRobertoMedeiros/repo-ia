---
name: shared-validation-rule
description: Cria regras de validação reutilizáveis no pacote compartilhado da aplicação, seguindo o padrão existente de contratos, utilitários, códigos de erro, exports e testes unitários completos.
---

# Shared Validation Rule

Use esta skill quando o pedido for criar ou atualizar uma regra reutilizavel em `packages/shared/src/validation/rules`.

## Objetivo

- Criar novas regras de validacao reutilizaveis dentro de `packages/shared`.
- Seguir exatamente o padrao estrutural, semantico e de testes ja adotado no projeto.
- Reaproveitar `packages/shared/src/validation/rule.utils.ts` sempre que fizer sentido.
- Criar testes unitarios robustos e curtos, focados no contrato observavel da regra.
- Garantir integracao correta com os exports do pacote shared.
- Entregar uma regra simples, previsivel, reutilizavel e facil de manter.

## Entradas obrigatorias

So execute a implementacao quando estas entradas estiverem claras no pedido ou puderem ser inferidas com baixo risco:

1. Nome da regra a ser criada.
2. Objetivo da validacao.
3. Tipo principal do valor validado: `string`, `number`, `date`, `array` ou `mixed`.
4. Codigo de erro esperado quando a regra falhar.

## Entradas opcionais

- Parametros da regra, quando houver: minimo, maximo, lista de valores, regex, configuracoes de comportamento.
- Exemplos de valores validos e invalidos.
- Se a regra deve ignorar valores vazios ou trata-los como invalidos.

## Leitura obrigatoria

Antes de criar a regra, leia obrigatoriamente os arquivos abaixo, nesta ordem:

1. `packages/shared/src/validation/validation-rule.interface.ts`
2. `packages/shared/src/validation/validation-field.interface.ts`
3. `packages/shared/src/validation/validator.ts`
4. `packages/shared/src/validation/rule.utils.ts`
5. `packages/shared/src/validation/index.ts`
6. `packages/shared/src/validation/rules/index.ts`
7. Regras de referencia:
   - `packages/shared/src/validation/rules/required.rule.ts`
   - `packages/shared/src/validation/rules/email.rule.ts`
   - `packages/shared/src/validation/rules/min-length.rule.ts`
   - `packages/shared/src/validation/rules/range-length.rule.ts`
   - `packages/shared/src/validation/rules/strong-password.rule.ts`
   - `packages/shared/src/validation/rules/person-name.rule.ts`
8. Testes de referencia:
   - `packages/shared/test/validation/rules/required.rule.test.ts`
   - `packages/shared/test/validation/rules/email.rule.test.ts`
   - `packages/shared/test/validation/rules/min-length.rule.test.ts`
   - `packages/shared/test/validation/rules/range-length.rule.test.ts`
   - `packages/shared/test/validation/rules/security-rules.test.ts`
   - `packages/shared/test/validation/rules/string-rules.test.ts`

Se a nova regra exigir utilitario novo ou alterar comportamento utilitario, leia e atualize tambem:

- `packages/shared/test/validation/rule.utils.test.ts`
- `packages/shared/test/validation/validator.test.ts` quando a integracao com `Validator.validate(...)` precisar de cobertura adicional
- `packages/shared/src/index.ts` quando houver duvida sobre a cadeia final de exports do pacote

Consulte tambem `references/mandatory-readings.md` e os few-shots locais desta skill antes de escrever codigo novo.

## Few-shots internos

Os few-shots desta skill ficam em `references/few-shots/` e devem ser usados como referencia pratica imediata:

- `required.rule.example.ts`
- `required.rule.test.example.ts`
- `email.rule.example.ts`
- `email.rule.test.example.ts`
- `min-length.rule.example.ts`
- `min-length.rule.test.example.ts`
- `range-length.rule.example.ts`
- `range-length.rule.test.example.ts`
- `strong-password.rule.example.ts`
- `strong-password.rule.test.example.ts`

Eles existem para mostrar o padrao real de implementacao e teste sem depender de arquivos externos para o papel didatico.

## Fluxo deterministico

1. Normalizar o nome da regra em `kebab-case` para o arquivo e em PascalCase com sufixo `Rule` para a classe.
2. Ler todas as referencias obrigatorias do projeto.
3. Ler os few-shots internos mais proximos do caso.
4. Definir o contrato da regra:
   - implementar `ValidationRule`;
   - expor `validate(value: unknown): string | null`;
   - retornar `null` quando valido;
   - retornar apenas o sufixo do erro quando invalido;
   - nunca montar `<field.code>.<errorCode>` dentro da regra;
   - nunca lancar excecao diretamente;
   - nunca criar efeitos colaterais.
5. Decidir o comportamento para valores vazios:
   - por padrao, regras opcionais ignoram vazio e retornam `null`;
   - deixe obrigatoriedade para `RequiredRule`;
   - so trate vazio como invalido quando isso vier explicitamente do pedido e for coerente com o padrao existente.
6. Reaproveitar utilitarios existentes antes de criar logica propria:
   - `validateStringValues`
   - `validateNumberValues`
   - `validateDateValues`
   - `validateEachValue`
   - `isEmptyValue`
   - `getValueLength`
   - `toValidDate`
   - `testPattern`
7. So criar nova funcao em `rule.utils.ts` quando ela for claramente generica e reutilizavel por outras regras.
8. Implementar a regra em `packages/shared/src/validation/rules/<rule-name>.rule.ts`.
9. Atualizar `packages/shared/src/validation/rules/index.ts`.
10. Verificar se os exports agregados continuam acessiveis por:
    - `packages/shared/src/validation/index.ts`
    - `packages/shared/src/index.ts`
    - preservar exports existentes e adicionar apenas o necessario
11. Criar ou atualizar `packages/shared/test/validation/rules/<rule-name>.rule.test.ts`.
12. Se houver utilitario novo, criar ou atualizar os testes dele em `packages/shared/test/validation/rule.utils.test.ts`.
13. Rodar os testes relevantes do pacote shared e complementar cobertura ate a nova regra atingir 100%.

## Regras de implementacao

- O arquivo da regra deve ser sempre `packages/shared/src/validation/rules/<rule-name>.rule.ts`.
- O nome do arquivo deve ser sempre em `kebab-case`.
- O nome da classe deve ser em PascalCase com sufixo `Rule`.
- Toda regra deve implementar `ValidationRule`.
- O metodo deve seguir exatamente `validate(value: unknown): string | null`.
- A regra deve retornar apenas o sufixo do erro, por exemplo:
  - `required`
  - `invalid.email`
  - `min.length`
  - `range.length`
  - `strong.password`
  - `person.name`
- O `Validator` e quem monta o erro completo no formato `<field.code>.<errorCode>`.
- Nao duplicar logica ja existente em `rule.utils.ts`.
- Manter a implementacao curta, previsivel e legivel.
- Quando a regra aceitar parametros, recebe-los por construtor, no mesmo estilo das regras existentes.
- Quando a regra validar colecoes ou multiplos valores, seguir o estilo das regras atuais baseadas em `validateEachValue` e derivados.

## Regras para os testes

- O teste da regra deve viver em `packages/shared/test/validation/rules/<rule-name>.rule.test.ts`.
- Seguir o estilo do projeto:
  - imports a partir de `../../../src/index`;
  - `describe("<ClassName>Rule", ...)`;
  - testes curtos, claros e orientados ao contrato;
  - evitar indirecao desnecessaria.
- Cobrir, no minimo:
  - cenario valido;
  - cenario invalido;
  - comportamento com valores vazios, quando aplicavel;
  - comportamento com tipos invalidos, quando aplicavel;
  - comportamento dos parametros, quando existirem;
  - cenarios limite relevantes.
- Se a regra reutilizar utilitario com branches relevantes, testar o comportamento observavel da regra sem duplicar teste do utilitario alem do necessario.
- Se houver nova funcao utilitaria, criar testes diretos para ela em `packages/shared/test/validation/rule.utils.test.ts`.
- Se o usuario fornecer exemplos de valores validos e invalidos, reproduzir esses exemplos nos testes sempre que fizer sentido.
- A cobertura esperada para a nova regra e 100%.

## Verificacao

Rodar a verificacao a partir da raiz do monorepo:

```bash
SHARED_PKG=$(node -p "require('./packages/shared/package.json').name")
npm run test --workspace "$SHARED_PKG" -- --runInBand --runTestsByPath "packages/shared/test/validation/rules/<rule-name>.rule.test.ts"
npm run test --workspace "$SHARED_PKG" -- --runInBand
```

Se houve alteracao em `rule.utils.ts`, validar tambem:

```bash
SHARED_PKG=$(node -p "require('./packages/shared/package.json').name")
npm run test --workspace "$SHARED_PKG" -- --runInBand --runTestsByPath "packages/shared/test/validation/rule.utils.test.ts"
```

Nao encerrar a tarefa enquanto:

- a regra nao estiver exportada corretamente;
- o teste da regra nao existir;
- a cobertura observavel da nova regra nao estiver completa;
- o comportamento nao estiver coerente com `Validator.validate(...)`.

## Saida esperada

Ao concluir uma implementacao baseada nesta skill, o resultado minimo deve incluir:

- `packages/shared/src/validation/rules/<rule-name>.rule.ts`
- atualizacao de `packages/shared/src/validation/rules/index.ts`
- teste em `packages/shared/test/validation/rules/<rule-name>.rule.test.ts`
- atualizacoes adicionais em exports agregados apenas se realmente necessarias
- atualizacao de `rule.utils.ts` e `rule.utils.test.ts` somente quando surgir um helper novo e claramente reutilizavel

## Restricoes

- Esta skill nao cria entidades, casos de uso ou controllers.
- Esta skill existe apenas para criar regras reutilizaveis no pacote shared.
- Nao inventar um padrao novo se o projeto ja possui um.
- Nao criar documentacao extra fora desta pasta de skill.
- Nao pular a leitura das referencias obrigatorias.
- Nao alterar regras, exports ou testes nao relacionados alem do necessario para integrar a nova regra.
