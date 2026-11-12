---
name: config-project-fullstack
description: Cria do zero um monorepo Turborepo (npm) com frontend Next.js (porta 3000) e backend NestJS com @nestjs/config, CORS e .env (porta 4000). Aceita um namespace opcional (ex. @minha-empresa) para renomear todos os pacotes. Use quando o usuário pedir para configurar/criar o projeto fullstack.
argument-hint: "[@namespace] [--name <projeto>] [--skip-verify]"
---

# config-project-fullstack

Esta skill é **determinística**: todo o trabalho é feito pelo script `scripts/setup.mjs`.
Não execute os passos manualmente, não altere a ordem, não improvise comandos extras.

## Como executar

1. Rode o script a partir do diretório atual do projeto, repassando exatamente os argumentos recebidos (`$ARGUMENTS`):

   ```bash
   node .claude/skills/config-project-fullstack/scripts/setup.mjs $ARGUMENTS
   ```

   - Sem argumentos → cria `./projeto-exemplo` com os nomes de pacote padrão.
   - `@escopo` ou `--namespace @escopo` → ao final, renomeia `frontend`, `backend` e todos os pacotes de `packages/*` (ex. `@repo/ui`) para `@escopo/<nome>`, atualizando dependências e imports.
   - `--name <projeto>` → muda o nome da pasta criada.
   - `--skip-verify` → pula o build e o teste das portas.

   O processo demora alguns minutos (downloads e `npm install`). Use timeout de 600000 ms ou execute em background.

2. Se o script terminar com `✖ ERRO`, **não tente corrigir manualmente nem rodar de novo por conta própria**: mostre ao usuário o passo e a mensagem de erro. O script nunca apaga uma pasta existente; se a pasta de destino já existir, peça ao usuário que a remova ou informe outro `--name`.

3. Se terminar com `✔ CONCLUÍDO COM SUCESSO`, mostre ao usuário o resumo final (pasta, nomes dos pacotes, portas).

## O que o script faz (em ordem)

1. Verifica pré-requisitos: Node >= 20.9, npm/npx, pasta de destino inexistente, permissão de escrita, portas 3000/4000 livres.
2. `npx create-turbo@latest <projeto> -m npm`
3. Remove `apps/*`
4. `npx create-next-app@latest frontend --yes --src-dir` (em `apps/`)
5. `npm i -g @nestjs/cli`
6. `nest new backend -g -p npm` (em `apps/`)
7. `npm install @nestjs/config` (em `apps/backend`)
8. Sobrescreve `apps/backend/src/app.module.ts` (ConfigModule global) e `apps/backend/src/main.ts` (CORS + porta 4000)
9. Adiciona `"dev": "nest start --watch"` em `apps/backend/package.json`
10. Cria `.env.example` e `.env` no frontend (`NEXT_PUBLIC_API_URL=http://localhost:4000`) e no backend (`PORT=4000`)
11. `npm install` na raiz
12. Aplica o namespace (se informado) e reinstala para religar os workspaces
13. Verificação: `turbo run build`; sobe o backend com uma porta temporária definida só no `.env` (prova que o ConfigModule lê o `.env`), restaura o `.env`, confirma o backend em `http://localhost:4000` e o frontend em `http://localhost:3000`
