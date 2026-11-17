# 003-configurar-frontend

## Objetivo

Configurar os componentes básicos da aplicação front-end, estabelecendo a estrutura compartilhada e as rotas Next.js para as áreas pública e privada.

## Contexto Técnico

- Skill única de execução: [frontend-next-config](../../../.claude/skills/frontend-next-config).
- A skill detecta automaticamente o projeto frontend existente e aplica a configuração padronizada.
- Não há decisões de negócio envolvidas — é uma tarefa exclusivamente de infraestrutura de front-end.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

Nenhuma regra específica além do que a skill já encapsula.

## Tasks

### Tasks - Front-end

- [x] Executar a skill [frontend-next-config](../../../.claude/skills/frontend-next-config) para configurar a estrutura compartilhada (`shared/`) e as rotas Next.js com grupos public/private e sidebar de navegação.
  > ✅ 2026-11-16 21:45 — Skill `frontend-next-config` aplicada em `apps/frontend` com os padrões (destino detectado, guard de autenticação como TODO no layout privado). Criados: `src/shared/` (componentes UI, contexto do shell, hooks, i18n, template `AdminShell`/`PublicBoxedLayout`, tipo `ApiErrorResponse`, navegação com sidebar), `globals.css` com o design system, `app/layout.tsx` (TooltipProvider), landing `app/page.tsx`, `(public)/layout.tsx` e `(public)/join`, `(private)/layout.tsx` com sidebar e `(private)/example/dashboard`. A rota `/auth` do módulo `auth` foi preservada. Dependências instaladas no workspace `@sdd/frontend`, incluindo `@sdd/shared`. Desvios: (1) o npm instalou `react-day-picker` v10, incompatível com os assets da skill (`classNames.caption`, `initialFocus`); fixado em `^9`, o que fez o build passar; (2) o lint do frontend passou a falhar com 78 erros (`no-explicit-any`/`no-namespace`) no código embarcado de `src/shared`, então `eslint.config.mjs` ganhou um override restrito a `src/shared/**`, sem alterar o código da skill. Validação: `next build` OK (rotas `/`, `/join`, `/example/dashboard`, `/auth`); `next start` respondeu 200 nas 4 rotas sem erros no log; `turbo run build lint check-types test` com 11/11 tarefas OK.

## Resultado Esperado

- Pasta `shared/` criada com os componentes e utilitários base do front-end.
- Grupos de rotas `(public)` e `(private)` configurados no Next.js com sidebar de navegação funcional.
- Aplicação front-end inicializa sem erros após a configuração.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
