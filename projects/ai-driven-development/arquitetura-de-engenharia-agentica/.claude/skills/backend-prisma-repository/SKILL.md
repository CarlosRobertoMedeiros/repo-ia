---
name: backend-prisma-repository
description: 'Criar a implementacao Prisma de uma interface de repositorio de um modulo de dominio dentro do backend NestJS. Usar quando o pedido envolver informar explicitamente uma interface de repositorio em `modules/<modulo>/src/**`, gerar o arquivo `*.prisma.ts` correspondente direto em `apps/backend/src/modules/<modulo>` por padrao, registrar a classe concreta no modulo Nest com `DbModule` e `PrismaService`, e conectar operacoes basicas de banco como `create`, `update`, `delete`, `findById` e `findPage`.'
---

# Backend Prisma Repository

## Objetivo

Implementar no backend NestJS a versao Prisma de uma interface de repositorio definida em um modulo de negocio dentro de `modules/`.
Esta skill trabalha sobre um unico contrato por execucao e deve criar a implementacao `*.prisma.ts`, registrar a classe concreta no modulo Nest correspondente e garantir uso do `PrismaService` fornecido por `DbModule`.

## Trava obrigatoria

- Esta skill so pode executar quando a interface de repositorio alvo for informada explicitamente.
- Entradas aceitas:
  - nome exato da interface, como `UserRepository`, quando o contexto apontar de forma inequivoca para um unico arquivo
  - path do arquivo da interface, como `modules/auth/src/user/provider/user.repository.ts`
  - referencia equivalente que identifique um unico contrato de repositorio
- Se a interface nao for fornecida ou houver ambiguidade entre mais de um arquivo, parar imediatamente.
- Nessa situacao, pedir ao usuario que informe qual interface de repositorio deseja implementar.
- Sem essa informacao, nao ler para inferir por semelhanca, nao editar arquivos e nao registrar providers.
- Esta skill nao pode modificar o arquivo da interface do repositorio informada nem qualquer outro arquivo do modulo de dominio dentro de `modules/<modulo>/src/**`.
- Esta skill nao pode adicionar, remover ou alterar exports, tokens, tipos, metodos, imports ou qualquer outro trecho da interface original.

## Escopo

- Ler a interface informada dentro de `modules/<modulo>/src/**`.
- Inferir o modulo pelo path real do arquivo em `modules/<modulo>/...`.
- Criar a implementacao Prisma dentro de `apps/backend/src/modules/<modulo>`.
- Por padrao, criar o arquivo na raiz do modulo backend, sem reproduzir subpastas do dominio, a menos que o usuario peça explicitamente outra organizacao.
- Ajustar apenas o modulo Nest correspondente e os arquivos minimos necessarios do backend para a injecao de dependencia funcionar.
- Nunca editar o contrato original do repositorio como parte dessa skill.

## Convencoes obrigatorias

- O arquivo de implementacao deve terminar com `.prisma.ts`.
- O nome do arquivo deve seguir o repositorio informado, removendo o sufixo `.repository` quando existir.
  - Exemplo: `user.repository.ts` gera `user.prisma.ts`.
- O path do backend deve ser, por padrao, a raiz do modulo backend.
  - Exemplo: `modules/auth/src/user/provider/user.repository.ts`
  - Destino padrao: `apps/backend/src/modules/auth/user.prisma.ts`
- So criar subpastas quando o usuario pedir explicitamente ou quando houver uma convencao local ja consolidada e necessaria para nao quebrar o modulo existente.
- A classe concreta deve seguir o padrao `Prisma<NomeDaInterface>`.
  - Exemplo: `PrismaUserRepository implements UserRepository`
- A implementacao deve injetar `PrismaService` via construtor.
- O modulo Nest do backend deve importar `DbModule`.
- O modulo Nest deve registrar a classe Prisma concreta em `providers`.
- Quando o modulo precisar expor esse repositorio para outros modulos Nest, exportar a propria classe concreta.

## Workflow

1. Validar a entrada obrigatoria.
   - Confirmar que existe exatamente uma interface alvo.
   - Confirmar que o arquivo pertence a `modules/<modulo>/src/`.
   - Se isso falhar, interromper.
2. Ler o contrato e o contexto minimo.
   - Abrir o arquivo da interface.
   - Ler os tipos relacionados necessarios para implementar o contrato com seguranca.
   - Quando a interface estender `CrudRepository`, ler os generics usados e os tipos de entidade, entrada e paginacao.
3. Inferir destinos e nomes.
   - Resolver o modulo pelo path em `modules/<modulo>`.
   - Resolver o modulo backend em `apps/backend/src/modules/<modulo>/<modulo>.module.ts`.
   - Resolver o destino do arquivo Prisma na raiz do modulo backend por padrao.
   - Se o usuario especificar outro path, obedecer a instrucao explicita.
4. Implementar a classe Prisma.
   - Criar o arquivo `*.prisma.ts` no backend.
   - Injetar `PrismaService`.
   - Implementar os metodos exigidos pelo contrato.
   - Se a interface estender `CrudRepository`, implementar no minimo `create`, `update`, `delete`, `findById` e `findPage`.
5. Conectar ao Nest.
   - Atualizar `apps/backend/src/modules/<modulo>/<modulo>.module.ts`.
   - Adicionar `DbModule` em `imports`.
   - Registrar `Prisma<NomeDaInterface>` diretamente em `providers`.
   - Exportar `Prisma<NomeDaInterface>` quando o modulo backend precisar disponibilizar o repositorio para outros modulos.
6. Revisar consumo.
   - Em classes Nest do backend, preferir injecao direta da classe concreta, por exemplo `constructor(private readonly userRepository: PrismaUserRepository)`.
   - Quando houver um caso de uso de dominio que dependa da interface, deixar a classe concreta ser passada para esse caso de uso sem alterar o contrato do dominio.
   - Nao alterar classes puras de dominio que nao participam do grafo de injecao do Nest.
7. Reportar resultado.
   - Informar interface implementada, modulo inferido, arquivos criados ou alterados e qualquer ponto que precise revisao manual.

## Regra de implementacao

- Priorizar contratos que estendem `CrudRepository`.
- Mapear `findPage` para `PageResult<T>` preservando `items`, `page`, `perPage` e `total`.
- Reaproveitar o model Prisma ja existente no client quando ele estiver claramente definido.
- Quando o nome do model Prisma nao puder ser inferido com seguranca a partir da entidade ou do schema existente, interromper e pedir confirmacao em vez de inventar o acesso.
- Interfaces TypeScript continuam sendo uteis como contrato de dominio, mas a injecao no Nest deve usar a classe concreta por padrao, sem exigir token simbolico.
- Nao colocar regras de negocio na implementacao Prisma; ela deve ficar restrita a persistencia e mapeamento.
- Se a entidade exigir conversao entre model de dominio e payload Prisma, criar metodos privados de mapeamento no proprio arquivo.
- Se a entidade possuir construtor ou fabrica que precise ser usada para reidratar o dominio, seguir o proprio modulo de negocio em vez de retornar objetos literais.

## Integracao com Database

- A implementacao deve depender de `PrismaService` importado de `apps/backend/src/db/prisma.service`.
- O modulo backend deve depender de `DbModule` importado de `apps/backend/src/db/db.module`.
- Nao instanciar `PrismaClient` diretamente dentro do repositorio Prisma.
- Nao duplicar configuracao de conexao fora do modulo de database ja existente.

## Guardrails

- Nao executar sem a interface de repositorio explicitamente informada.
- Nao inferir modulo sem um path ou contrato univoco.
- Nao modificar o arquivo da interface alvo nem qualquer arquivo do dominio em `modules/<modulo>/src/**`.
- Nao editar outros modulos do backend fora do necessario para o repositorio alvo.
- Nao alterar schema Prisma, migrations, seeds ou entidades de dominio como parte desta skill, a menos que o pedido inclua isso explicitamente.
- Nao exigir token simbolico por padrao para a implementacao funcionar no backend.
- Nao criar subpastas no modulo backend sem necessidade ou sem pedido explicito do usuario.
- Se o contrato nao puder ser implementado apenas com operacoes Prisma basicas, relatar a lacuna antes de continuar.

## Saida esperada

- Implementacao Prisma criada em `apps/backend/src/modules/<modulo>/<nome>.prisma.ts` por padrao.
- Modulo Nest atualizado com `DbModule` e com a classe Prisma registrada em `providers`.
- Consumidores Nest atualizados para injetar a classe concreta quando isso fizer sentido no backend.

## Referencias

- Consultar `references/prisma-repository-implementation.md` para o checklist detalhado, convencoes de path e exemplo concreto com `UserRepository`.
