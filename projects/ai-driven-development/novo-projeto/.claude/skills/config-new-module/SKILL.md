---
name: config-new-module
description: Cria um novo módulo de negócio em modules/<nome-do-modulo> no monorepo (estrutura pré-definida com TypeScript e Jest), adiciona o pacote @namespace/<nome-do-modulo> como dependência do frontend e do backend, ajusta workspaces e ts-node na raiz e roda instalação, build e testes. Exige namespace. Use quando o usuário pedir para criar/adicionar um novo módulo.
argument-hint: "<nome-do-modulo> @namespace"
---

# config-new-module

Esta skill é **determinística**: todo o trabalho é feito pelo script `scripts/create-module.mjs`.
Não execute os passos manualmente, não altere a ordem, não improvise comandos extras.

## Como executar

1. Dos argumentos recebidos (`$ARGUMENTS`), extraia:
   - **nome do módulo**: em kebab-case minúsculo (ex.: `auth`, `user-profile`);
   - **namespace**: o valor que começa com `@` (ex.: `@meu-projeto`).

   **Se o namespace não foi informado, NÃO execute a skill**: avise o usuário que o namespace é obrigatório e peça-o.
   Se o nome do módulo não foi informado, peça-o também. Não invente nenhum dos dois.

2. Rode o script **a partir da raiz do monorepo** (onde ficam `package.json`, `apps/` e `packages/`):

   ```bash
   node .claude/skills/config-new-module/scripts/create-module.mjs --name <nome-do-modulo> --namespace <@namespace>
   ```

   O processo leva alguns minutos (`npm install` e build). Use timeout de 600000 ms.

3. Se o script terminar com `✖ ERRO`, **não tente corrigir manualmente nem rodar de novo por conta própria**:
   mostre ao usuário o passo e a mensagem de erro. O script nunca apaga nada; se `modules/<nome>` já existir,
   peça ao usuário que o remova ou informe outro nome.

4. Se terminar com `✔ CONCLUÍDO COM SUCESSO`, mostre ao usuário o resumo final (pasta, nome do pacote, apps alterados).

## O que o script faz (em ordem)

1. Verifica pré-requisitos: namespace e nome válidos, raiz do monorepo com `apps/frontend` e `apps/backend`,
   assets da skill presentes e `modules/<nome>` inexistente.
2. Cria a pasta `modules/` caso ela não exista.
3. Cria `modules/<nome>` copiando literalmente os arquivos de `assets/`:
   `jest.config.ts`, `tsconfig.json`, `package.json` (com `"name": "<@namespace>/<nome>"`), `src/index.ts` e `test/index.test.ts`.
4. Adiciona `"<@namespace>/<nome>": "*"` em `dependencies` de `apps/frontend/package.json` e `apps/backend/package.json`.
5. No `package.json` da raiz: garante `"ts-node": "^10.9.2"` em `devDependencies` (movendo-o de `dependencies`, se estiver lá)
   e garante `apps/*`, `packages/*` e `modules/*` em `workspaces`.
6. Garante `"dist/**"` nas saídas (`outputs`) da tarefa `build` do `turbo.json`, pois o módulo é consumido via `dist/index.js`.
7. `npm install` na raiz e confirma o link do pacote em `node_modules`.
8. `npm run build` na raiz e confirma `modules/<nome>/dist/index.js`.
9. `npm test -w <@namespace>/<nome>`.

## Assets

Os arquivos em `assets/` são o modelo do módulo. Para mudar a estrutura de todos os módulos futuros, edite-os ali.
No `assets/package.json`, os marcadores `{{NAMESPACE}}` e `{{MODULE}}` são substituídos pelo namespace e pelo nome do módulo.
