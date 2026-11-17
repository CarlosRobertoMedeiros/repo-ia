# NNN-cadastro-{{entidade}}

> Template de cadastro (CRUD) de uma entidade qualquer dentro de um módulo de negócio **existente**.
> Antes de usar, substitua os placeholders abaixo e remova esta seção de instruções.
>
> **Placeholders:**
> - `{{entidade}}` — nome da entidade no singular, kebab-case (ex.: `user`, `produto`, `pedido`).
> - `{{Entidade}}` — mesma entidade em PascalCase (ex.: `User`, `Produto`, `Pedido`).
> - `{{entidades}}` — plural em kebab-case usado em rotas/URLs (ex.: `users`, `produtos`, `pedidos`).
> - `{{modulo}}` — módulo de negócio onde o cadastro vive (ex.: `auth`, `catalog`, `vendas`). **Assume-se que o módulo já existe**; este template não cria módulos novos.
> - `{{campos}}` — lista dos campos da entidade com a regra de validação aplicada (ex.: `name` (person name), `email` (email), `password` (hash pass)).
> - `{{colunas-listagem}}` — colunas exibidas na tabela da listagem (ex.: nome, e-mail).
> - `{{secoes-formulario}}` — agrupamento de campos em seções do formulário (ex.: "Dados básicos" (nome, e-mail)).
> - `{{rotulo-menu}}` — rótulo do item adicionado ao menu lateral (ex.: "Usuários", "Produtos").

## Objetivo

Entregar o CRUD de `{{entidade}}` no módulo `{{modulo}}`, com agregado, persistência, endpoints e interface de listagem e formulário compartilhado entre criação e edição.

## Contexto Técnico

- Módulo de negócio: `{{modulo}}` (já existente), agregado `{{entidade}}`.
- Backend NestJS com controller dedicado para o CRUD e persistência via Prisma.
- Front-end Next.js com listagem paginada e formulário compartilhado entre criação e edição, dentro do módulo `{{modulo}}` em rota privada.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- O caso de uso `save-{{entidade}}` cobre tanto criação quanto atualização.
- Casos de uso de comando retornam `void`. Consultas não viram caso de uso — o controller chama o repositório direto.
- O projeto não usa DTOs de entrada. **Respostas de leitura devem ser mapeadas para objetos simples no controller antes de retornar** — entidades de domínio usam `protected readonly props` com getters de prototype, que não serializam via `JSON.stringify` (produzem `{}`). O controller deve construir explicitamente o objeto de retorno.
- A listagem fica dentro do módulo `{{modulo}}` no front-end, em rota privada.
- **Sem verificação automatizada de UI nesta spec.** As validações automatizadas vão até a camada de backend (testes unitários do módulo + cenários no Rest Client). O usuário valida a interface manualmente.

## Tasks

### Tasks - Negócio (módulo {{modulo}})

- [ ] Criar o agregado `{{entidade}}` dentro do módulo `{{modulo}}` com a skill [module-aggregate](../../../.claude/skills/module-aggregate).

- [ ] Implementar a entidade `{{Entidade}}` com a skill [module-entity](../../../.claude/skills/module-entity), com os campos: {{campos}}.

- [ ] Definir o contrato do repositório de `{{entidade}}` com a skill [module-repository](../../../.claude/skills/module-repository).

- [ ] Implementar o caso de uso `save-{{entidade}}` com a skill [module-use-case](../../../.claude/skills/module-use-case). A decisão entre criar e atualizar deve ser baseada em uma consulta ao repositório (`findById`): se `id` vier na entrada e `findById` retornar um registro, executa atualização; caso contrário (sem `id` ou registro não encontrado), executa criação usando o `id` recebido ou gerando um novo.

- [ ] Implementar o caso de uso `delete-{{entidade}}` com a skill [module-use-case](../../../.claude/skills/module-use-case). Lançar `DomainError("{{entidade}}.not_found", 404)` quando o `id` não existir.

- [ ] Cobrir os dois casos de uso com testes unitários, usando os fakes do módulo (`Fake{{Entidade}}Repository` e demais providers necessários).

### Tasks - Back-end

- [ ] Sincronizar o módulo `{{modulo}}` com o Prisma criando/atualizando o model da entidade `{{entidade}}` com a skill [backend-prisma-sync-module](../../../.claude/skills/backend-prisma-sync-module).

- [ ] Implementar o repositório Prisma de `{{entidade}}` em `apps/backend/src/modules/{{modulo}}` com a skill [backend-prisma-repository](../../../.claude/skills/backend-prisma-repository), sem alterar a interface definida no módulo.

- [ ] Criar/atualizar `apps/backend/src/modules/{{modulo}}/{{entidade}}.controller.ts` com a skill [backend-nest-controller](../../../.claude/skills/backend-nest-controller), expondo o CRUD em `/{{entidades}}` (criar, atualizar, excluir, obter por id e listar paginado). Endpoints autenticados. Consultas chamam o repositório direto; comandos instanciam o caso de uso correspondente no corpo do método.

- [ ] Criar `apps/backend/src/modules/{{modulo}}/{{entidade}}.integration.http` (Rest Client) cobrindo os fluxos do CRUD, incluindo os principais casos de erro. Validar manualmente com o backend rodando.

### Tasks - Front-end

> ⚠️ Sem validação automatizada de UI. O agente entrega o código + `npx tsc --noEmit` limpo; a verificação visual é manual.

- [ ] Criar a listagem paginada de `{{entidades}}` no módulo `{{modulo}}`, em rota privada. Tabela com as colunas {{colunas-listagem}} e ações (ícones de editar e excluir).

- [ ] Criar o formulário de `{{entidade}}` compartilhado entre criação e edição, organizado em seções via [`form-section-layout`](../../../apps/frontend/src/shared/components/ui/form-section-layout.tsx): {{secoes-formulario}}.

- [ ] Integrar a coluna de ações: lápis navega para a edição; lixeira abre [`delete-confirmation-dialog`](../../../apps/frontend/src/shared/components/ui/delete-confirmation-dialog.tsx) e, ao confirmar, chama o backend e atualiza a tabela.

- [ ] Adicionar o item "{{rotulo-menu}}" no menu lateral apontando para a listagem de `{{entidades}}`.

- [ ] Acrescentar no i18n as chaves novas que aparecerem (ex.: `{{entidade}}.not_found` e mensagens específicas de validação). Reaproveitar as chaves já cadastradas em specs anteriores.

- [ ] Rodar `npx tsc --noEmit` em `apps/frontend` e sinalizar ao usuário que a UI está pronta para conferência manual.

## Resultado Esperado

- Agregado `{{entidade}}` com entidade validada, repositório contratado e casos de uso `save-{{entidade}}` e `delete-{{entidade}}` implementados e testados.
- Model `{{entidade}}` sincronizado no Prisma com migration aplicada.
- CRUD de `{{entidade}}` exposto no backend via `{{Entidade}}Controller`, com cenários cobertos no `{{entidade}}.integration.http`.
- Listagem paginada, formulário compartilhado entre criação e edição e exclusão com confirmação funcionando no front-end, acessíveis pelo item "{{rotulo-menu}}" do menu lateral.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
