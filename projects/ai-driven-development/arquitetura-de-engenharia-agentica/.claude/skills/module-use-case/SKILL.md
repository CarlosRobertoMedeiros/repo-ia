---
name: module-use-case
description: Cria casos de uso padronizados para agregados dos módulos de negócio, com contratos de entrada e saída consistentes, implementação inicial simples, testes unitários completos e estrutura pronta para evolução pelo time.
---

# Module Use Case

Use esta skill quando o pedido for criar ou atualizar um caso de uso dentro de um modulo existente em `modules/`, preservando o padrao estrutural do projeto, criando os testes unitarios correspondentes e garantindo cobertura de 100% para o arquivo do caso de uso.

Esta skill nao cria controller, Prisma, adaptadores de backend, rotas HTTP ou qualquer integracao de infraestrutura. O foco aqui e somente:

- contrato de entrada e saida;
- orquestracao basica de dominio;
- dependencias explicitas do caso de uso;
- testes reais com fakes concretos;
- exports corretos;
- coverage de 100% para o caso de uso criado ou atualizado.

## Entradas obrigatorias

A skill so pode prosseguir quando estas informacoes estiverem claras:

1. `nome do modulo` ou um `path inequivoco` dentro de `modules/`.
2. `nome do agregado` ou o `path do agregado`.
3. `nome do caso de uso`.
4. `tipo de cenario`:
   - `crud`
   - `custom`
5. se o caso de uso `retorna saida` ou `nao retorna saida`.

## Entradas opcionais

- dependencias esperadas, como repositorios, providers ou outros contratos;
- campos da entrada;
- campos da saida, quando houver retorno;
- regras explicitas de comportamento;
- path explicito do destino final, quando o usuario quiser fugir do modo por convencao.

## Se faltar informacao

Se qualquer uma destas informacoes estiver vaga, pare e peca objetivamente apenas o que falta:

- modulo ou path;
- agregado ou path;
- nome do caso de uso;
- `crud` ou `custom`.
- se o caso de uso retorna saida relevante ou usa `void`.

Nao invente esses dados. Nao prossiga sem eles.

## Leituras obrigatorias

Antes de gerar qualquer codigo, leia obrigatoriamente os arquivos abaixo nesta ordem:

1. `modules/auth/src/user/usecase/register-user.usecase.ts`
2. `modules/auth/src/user/usecase/index.ts`
3. `modules/auth/test/user/usecase/register-user.usecase.test.ts`
4. `modules/auth/test/mock/fake-user.repository.ts`
5. `modules/auth/test/mock/fake-crypto.provider.ts`
6. `modules/auth/test/mock/index.ts`
7. `packages/shared/src/usecase/use-case.ts`
8. `packages/shared/src/usecase/index.ts`

Depois disso, leia tambem os materiais internos desta skill:

- `references/mandatory-readings.md`
- `references/few-shots/custom-register-user.usecase.example.ts`
- `references/few-shots/custom-register-user.usecase.test.example.ts`
- `references/few-shots/crud-find-user-by-id.usecase.example.ts`
- `references/few-shots/crud-find-user-by-id.usecase.test.example.ts`
- `references/few-shots/crud-delete-user.usecase.example.ts`
- `references/few-shots/crud-delete-user.usecase.test.example.ts`

Os few-shots existem para reforcar o padrao de estrutura, nomes, dependencia por construtor e testes com fakes concretos.

## Resolucao do destino

Esta skill aceita dois modos de resolucao:

### 1. Modo por convencao

Quando o usuario informar modulo e agregado por nome, use:

- caso de uso:
  - `modules/<modulo>/src/<aggregate>/usecase/<use-case>.usecase.ts`
- teste:
  - `modules/<modulo>/test/<aggregate>/usecase/<use-case>.usecase.test.ts`

### 2. Modo por path explicito

Quando o usuario informar paths, normalize para os destinos reais dentro do modulo:

- se vier um path do modulo, descubra `modules/<modulo>`;
- se vier um path do agregado, normalize para `modules/<modulo>/src/<aggregate>`;
- se vier um path da pasta `usecase/`, grave o arquivo nela;
- se vier o path final do arquivo `<nome>.usecase.ts`, use-o diretamente;
- o teste continua no padrao do modulo em `modules/<modulo>/test/<aggregate>/usecase/`, salvo quando o proprio pedido trouxer um path explicito e valido para o teste.

Se houver ambiguidade real entre dois destinos validos, pare e peca confirmacao objetiva.

## Convencoes obrigatorias

- Nome de arquivo sempre em `kebab-case`.
- Arquivo principal sempre com sufixo `.usecase.ts`.
- Arquivo de teste sempre com sufixo `.usecase.test.ts`.
- Nome da classe sempre em `PascalCase`.
- A classe nunca deve terminar com `UseCase`.
- Interface de entrada sempre com sufixo `In`.
- Interface de saida, quando existir, sempre com sufixo `Out`.

Exemplo:

- arquivo: `register-user.usecase.ts`
- classe: `RegisterUser`
- entrada: `RegisterUserIn`
- saida: `RegisterUserOut`

## Fluxo deterministico

1. Validar que `modules/<modulo>` existe.
2. Resolver o agregado:
   - se o usuario informou apenas o nome, usar `modules/<modulo>/src/<aggregate>`;
   - se informou path, normalizar para a pasta real do agregado;
   - se o path apontar para `usecase/` ou para um arquivo dentro dela, voltar ate a raiz do agregado.
3. Confirmar que o agregado existe antes de seguir.
4. Ler o `package.json` do modulo para descobrir o nome real do workspace de testes.
5. Ler o `index.ts` de `usecase/` do agregado, se existir.
6. Ler tambem o que for relevante para o caso concreto:
   - `provider/index.ts`;
   - contratos de repositorio ou provider usados pelo caso de uso;
   - `model/index.ts` e entidades usadas;
   - `test/mock/index.ts`;
   - fakes do modulo ja existentes.
7. Procurar primeiro por fakes concretos reutilizaveis em `modules/<modulo>/test/mock/`.
8. Criar ou atualizar o caso de uso.
9. Criar ou atualizar o teste.
10. Atualizar exports necessarios sem remover exports existentes.
11. Rodar os testes relevantes e verificar cobertura.
12. Se a cobertura do caso de uso nao for 100%, complementar os testes antes de encerrar.

## Estrutura obrigatoria do caso de uso

O arquivo deve seguir o padrao do projeto:

1. importar `UseCase` de `@<scope>/shared` quando o padrao local continuar valido;
2. declarar `export interface <CaseName>In`;
3. declarar `export interface <CaseName>Out` apenas quando houver retorno relevante;
4. declarar `export class <CaseName> implements UseCase<<CaseName>In, <OutOuVoid>>`;
5. receber dependencias pelo construtor;
6. expor `async execute(input: <CaseName>In): Promise<<OutOuVoid>>`.

Regras:

- quando nao houver saida relevante, use `void` e omita a interface `Out`;
- quando houver saida relevante, crie a interface `Out` local e retorne esse contrato;
- mantenha a implementacao simples, legivel e facil de evoluir;
- nao invente regra de negocio nao pedida;
- nao acople o caso de uso a backend, controller, Prisma ou HTTP;
- foque no contrato e na orquestracao basica de dominio.

## Regras por tipo de cenario

### `crud`

Para `crud`, siga uma implementacao minima e previsivel, compativel com casos como:

- criar;
- atualizar;
- excluir;
- buscar por id;
- buscar pagina.

Nesses cenarios:

- prefira dependencias simples, normalmente repositorios;
- reutilize tipos e contratos ja existentes do agregado;
- mantenha fluxo direto, sem condicoes extras desnecessarias;
- so adicione validacao extra quando o pedido trouxer essa necessidade explicitamente ou quando o padrao do modulo ja exigir.

### `custom`

Para `custom`:

- monte o caso de uso com base no que o usuario descreveu;
- continue com implementacao inicial simples e pouco opinativa;
- quando houver lacunas, prefira contratos minimos e placeholders uteis em vez de inventar comportamento detalhado;
- trate dependencias externas como contratos injetados pelo construtor.

## Regras para dependencias

- Procure primeiro contratos e tipos ja existentes no agregado.
- Reutilize repositorios, providers e entidades ja exportados pelo modulo.
- Nao introduza dependencia nova sem necessidade.
- Se o pedido citar dependencias esperadas, respeite isso.
- Se o caso de uso so orquestra uma chamada simples, nao crie camadas extras.

## Regras dos testes unitarios

O teste do caso de uso e obrigatorio.

Destino preferencial:

- `modules/<modulo>/test/<aggregate>/usecase/<use-case>.usecase.test.ts`

Cobertura minima obrigatoria do teste:

1. caminho feliz;
2. falhas de validacao, quando existirem;
3. dependencias chamadas ou nao chamadas conforme o fluxo;
4. todos os branches e condicionais existentes;
5. retorno esperado, quando houver saida;
6. comportamento quando erro e propagado ou tratado;
7. ausencia de efeitos colaterais quando o fluxo falhar antes do ponto critico.

Regras de qualidade:

- use implementacoes fake reais e concretas, nao mocks de framework como estrategia principal;
- priorize fakes existentes do modulo antes de criar novas;
- se existir fake adequada, reutilize-a e nao duplique;
- se nao existir fake adequada para uma dependencia essencial, crie uma fake simples e reutilizavel em `modules/<modulo>/test/mock/`;
- ao criar nova fake, exporte-a tambem em `modules/<modulo>/test/mock/index.ts`;
- use spies apenas como apoio pontual sobre classes concretas ou prototipos, como no exemplo de `User.prototype.validate`;
- escreva testes reais e uteis, nao superficiais.

## Reuso de fakes

Antes de criar uma fake nova, procure por:

- `modules/<modulo>/test/mock/fake-<aggregate>.repository.ts`
- outros `fake-*.ts` em `modules/<modulo>/test/mock/`
- exports existentes em `modules/<modulo>/test/mock/index.ts`

Se uma fake cobrir a dependencia:

- reutilize a classe existente;
- adapte o teste ao contrato dela;
- evite duplicacao com outro nome.

Se uma fake nao existir e for essencial:

- crie uma classe concreta simples;
- mantenha armazenamento em memoria ou comportamento previsivel;
- evite `jest.fn()` como estrutura principal da fake;
- deixe a fake pronta para ser reutilizada por outros testes do modulo.

## Exports e integracao

Ao concluir, garanta pelo menos:

- criacao ou atualizacao de `modules/<modulo>/src/<aggregate>/usecase/<use-case>.usecase.ts`
- criacao ou atualizacao de `modules/<modulo>/src/<aggregate>/usecase/index.ts`

Se necessario, atualize tambem o minimo indispensavel para manter a acessibilidade pelo padrao do modulo:

- barrel do agregado;
- barrel do modulo;
- `modules/<modulo>/test/mock/index.ts`, quando houver fake nova.

Preserve todos os exports existentes.

## Verificacao obrigatoria

Rode a verificacao a partir da raiz do monorepo:

```bash
MODULE_PKG=$(node -p "require('./modules/<modulo>/package.json').name")
npm run test --workspace "$MODULE_PKG" -- --runInBand --runTestsByPath "modules/<modulo>/test/<aggregate>/usecase/<use-case>.usecase.test.ts"
npm run test --workspace "$MODULE_PKG" -- --runInBand --coverage --collectCoverageFrom="src/<aggregate>/usecase/<use-case>.usecase.ts" --runTestsByPath "modules/<modulo>/test/<aggregate>/usecase/<use-case>.usecase.test.ts"
```

Se uma fake nova foi criada ou alterada e ela tiver logica propria com branch observavel, rode tambem os testes que a exercitam.

Nao encerre a tarefa enquanto:

- o caso de uso nao compilar no contexto do modulo;
- o teste nao existir;
- os exports nao estiverem corretos;
- a cobertura observavel do caso de uso nao atingir 100%.

## Entrega minima esperada

Ao aplicar esta skill corretamente, o resultado minimo deve incluir:

- o arquivo do caso de uso;
- o teste unitario correspondente;
- o `index.ts` de `usecase/` atualizado;
- atualizacao de `test/mock/index.ts`, se houver fake nova;
- validacao real dos testes e da cobertura.

## Restricoes

- Nao criar controller.
- Nao criar Prisma.
- Nao criar adapter de backend.
- Nao adicionar complexidade desnecessaria.
- Nao inventar regras de negocio nao pedidas.
- Nao pular a leitura obrigatoria.
- Nao alterar arquivos fora do modulo alvo e da propria skill alem do estritamente necessario para integrar o caso de uso.
