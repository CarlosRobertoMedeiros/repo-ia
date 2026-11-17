# Mandatory Readings

Leia estes arquivos do projeto antes de criar ou atualizar qualquer caso de uso com esta skill:

1. `modules/auth/src/user/usecase/register-user.usecase.ts`
2. `modules/auth/src/user/usecase/index.ts`
3. `modules/auth/test/user/usecase/register-user.usecase.test.ts`
4. `modules/auth/test/mock/fake-user.repository.ts`
5. `modules/auth/test/mock/fake-crypto.provider.ts`
6. `modules/auth/test/mock/index.ts`
7. `packages/shared/src/usecase/use-case.ts`
8. `packages/shared/src/usecase/index.ts`

Objetivo de cada bloco:

- `register-user.usecase.ts`: referencia principal de estrutura, contratos e orquestracao.
- `usecase/index.ts`: padrao de export do agregado.
- `register-user.usecase.test.ts`: estilo de teste e observacao de efeitos colaterais.
- `test/mock/*.ts`: estilo das fakes concretas do modulo.
- `packages/shared/src/usecase/*`: contrato base `UseCase<In, Out>`.

Depois das leituras acima, consulte os few-shots locais desta skill para acelerar a materializacao dos casos mais comuns sem fugir do padrao do projeto.
