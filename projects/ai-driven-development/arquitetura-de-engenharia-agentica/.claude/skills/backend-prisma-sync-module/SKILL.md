---
name: backend-prisma-sync-module
description: 'Sincronizar um módulo de domínio com o Prisma do backend. Usar quando o pedido envolver analisar entidades em `modules/<modulo>/src`, criar ou atualizar `apps/backend/prisma/models/<modulo>.model.prisma`, gerar migration incremental nomeada por módulo, aplicar a migration e manter o schema Prisma alinhado com as entidades que herdam de `Entity`.'
---

# Backend Sync Module Prisma

## Objetivo

Sincronizar exclusivamente a estrutura de persistência Prisma de um módulo do monorepo com base nas entidades declaradas em `modules/<modulo>`.
Esta skill recebe um módulo, analisa classes que herdam de `Entity<TState>`, gera ou atualiza o arquivo Prisma correspondente em `apps/backend/prisma/models/<modulo>.model.prisma`, cria uma migration incremental com o nome do módulo, executa a migration e mantém o banco alinhado com o estado atual do módulo.
Esta skill só deve seguir com a execução quando o módulo alvo estiver explicitamente informado pelo usuário ou pelo contexto imediato da tarefa.

Não criar DTOs, adapters Prisma, repositories, seeds, controllers nem casos de uso, exceto se o pedido explicitar isso fora desta skill.
As instruções da skill devem permanecer em português do Brasil. Os arquivos e códigos gerados devem seguir a língua, convenções e estilo já adotados no projeto.

## Quando usar

- Quando o pedido for sincronizar entidades de um módulo com o Prisma.
- Quando houver criação ou alteração de entidades em `modules/<modulo>` e isso precisar virar schema e migration.
- Quando for necessário revisar se o schema Prisma de um módulo ficou desatualizado em relação ao domínio.
- Quando for preciso criar migrations incrementais focadas em um único módulo.

## Escopo de leitura

- Ler o módulo informado em `modules/<modulo>`.
- Procurar entidades em arquivos `**/*.entity.ts`.
- Priorizar classes `class Xxx extends Entity<...>`.
- Ler o `State` associado a cada entidade para descobrir os campos persistidos pelo domínio.
- Considerar os campos herdados de `EntityState` em `packages/shared/src/model/entity.ts`:
  - `id?: string`
  - `createdAt?: Date`
  - `updatedAt?: Date`
  - `deletedAt?: Date | null`

## Trava obrigatória

- Antes de qualquer leitura, edição de schema ou execução de migration, verificar se existe um módulo alvo claramente informado.
- São entradas válidas:
  - nome do módulo, como `auth`
  - path do módulo dentro de `modules/`
  - contexto inequívoco que aponte para um único módulo já citado na tarefa atual
- Se o módulo não tiver sido informado de forma clara, interromper a execução imediatamente.
- Nessa situação, a skill deve pedir ao usuário que informe qual módulo deseja sincronizar no Prisma do backend.
- Sem essa informação, não deve inferir módulo, não deve editar arquivos e não deve rodar comandos Prisma.

## Workflow

1. Resolver o módulo alvo.
   - Verificar primeiro se o módulo foi informado de forma explícita ou inequívoca.
   - Se o módulo não tiver sido informado, parar imediatamente e solicitar ao usuário o nome do módulo que deseja sincronizar.
   - Aceitar nome do módulo, path dentro de `modules/` ou contexto equivalente.
   - Normalizar para o nome real da pasta e para o nome do arquivo Prisma `<modulo>.model.prisma`.
2. Mapear o domínio persistível.
   - Ler todas as entidades do módulo.
   - Listar os campos declarados no `State` de cada entidade.
   - Incluir também os campos herdados de `EntityState`.
   - Identificar relações apenas quando elas estiverem claras no código do módulo.
3. Atualizar o schema Prisma do módulo.
   - Criar ou editar somente `apps/backend/prisma/models/<modulo>.model.prisma`.
   - Manter um model Prisma por entidade de domínio persistível.
   - Preservar a organização modular do Prisma: cada módulo fica no próprio arquivo.
   - Manter o nome do model Prisma coerente com a entidade de domínio, mas mapear a tabela física do banco para `snake_case`, em letras minúsculas e preferencialmente no plural.
   - Sempre que necessário, usar `@@map("<nome_da_tabela>")` para garantir esse padrão no banco. Exemplo: entidade `User` -> model `User` com `@@map("users")`.
   - Remover `apps/backend/prisma/models/bootstrap.model.prisma` quando o primeiro modelo real do domínio entrar no projeto e ele deixar de ser necessário.
4. Gerar migration incremental.
   - Se for a primeira sincronização do módulo, usar migration com nome igual ao módulo em kebab-case.
   - Se o módulo já existir no Prisma e houver diferenças, criar nova migration com `<modulo>-<sufixo-curto>`.
   - O sufixo deve descrever a alteração de forma curta e objetiva, por exemplo: `auth-add-user-table`, `auth-add-user-deleted-at`, `transactions-rename-status`.
5. Aplicar e validar.
   - Garantir que o banco esteja disponível antes da migration.
   - Rodar `npm --workspace apps/backend run prisma:migrate:dev -- --name <migration-name>`.
   - Rodar `npm --workspace apps/backend run prisma:generate`.
   - Revisar o SQL gerado quando houver risco de alteração destrutiva.
6. Reportar o resultado.
   - Informar entidades analisadas, arquivo Prisma alterado, nome da migration criada e qualquer suposição feita.
   - Se não houver diferença entre módulo e schema, dizer explicitamente que o módulo já estava sincronizado.

## Regras de mapeamento

- Assumir que cada entidade persistível precisa refletir os campos do `State`.
- Sempre considerar os campos base herdados de `EntityState`.
- Para nomes de tabelas no banco, adotar como padrão `snake_case`, em letras minúsculas e preferencialmente no plural.
- Quando o nome da entidade/model estiver em singular ou em PascalCase, preservar o nome idiomático do model Prisma e mapear a tabela com `@@map`. Exemplos:
  - `User` -> `@@map("users")`
  - `UserProfile` -> `@@map("user_profiles")`
- Mapear tipos primitivos de forma conservadora:
  - `string` -> `String`
  - `boolean` -> `Boolean`
  - `Date` -> `DateTime`
  - `number` -> escolher `Int`, `BigInt` ou `Decimal` apenas quando o contexto deixar isso claro
- Em caso de ambiguidade de tipo numérico, cardinalidade, nulabilidade, enum ou relação, explicitar a dúvida antes de consolidar um schema destrutivo.
- Usar `@map` e `@@map` apenas quando houver necessidade real de compatibilidade com naming existente ou com banco já criado.
- Evitar inferir estruturas que não aparecem no módulo. Se a relação não estiver clara no domínio, não inventar.

## Guardrails

- Não prosseguir sem módulo alvo explicitamente informado.
- Não alterar outros módulos Prisma sem necessidade direta do schema global.
- Não mexer em seeds nem adapters de persistência como parte do fluxo padrão desta skill.
- Não sobrescrever migrations antigas.
- Ao detectar rename de campo, remoção de coluna, troca de tipo ou mudança de nulabilidade, tratar como alteração de risco e revisar com cuidado o SQL gerado.
- Se o módulo não tiver nenhuma entidade que herda de `Entity`, informar que não há base suficiente para sincronização automática.

## Comandos base

- Subir o banco, quando necessário:
  - `npm --workspace apps/backend run db:start`
- Gerar/aplicar migration do módulo:
  - `npm --workspace apps/backend run prisma:migrate:dev -- --name <migration-name>`
- Atualizar o client Prisma:
  - `npm --workspace apps/backend run prisma:generate`

## Referencias

- Consultar `references/module-prisma-sync.md` para checklist operacional e armadilhas comuns.
