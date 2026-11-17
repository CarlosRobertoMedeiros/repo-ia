# 007-cadastro-produto

## Objetivo

Entregar o CRUD de `product` no módulo `catalog`, com agregado, persistência, endpoints e interface de listagem e formulário compartilhado entre criação e edição.

## Contexto Técnico

- Módulo de negócio: `catalog` (já existente), agregado `product`.
- Backend NestJS com controller dedicado para o CRUD e persistência via Prisma.
- Front-end Next.js com listagem paginada e formulário compartilhado entre criação e edição, dentro do módulo `catalog` em rota privada.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- O caso de uso `save-product` cobre tanto criação quanto atualização.
- Casos de uso de comando retornam `void`. Consultas não viram caso de uso — o controller chama o repositório direto.
- O projeto não usa DTOs de entrada. **Respostas de leitura devem ser mapeadas para objetos simples no controller antes de retornar** — entidades de domínio usam `protected readonly props` com getters de prototype, que não serializam via `JSON.stringify` (produzem `{}`). O controller deve construir explicitamente o objeto de retorno: `return { id: product.id, name: product.name, description: product.description, price: product.price, status: product.status, availableOnline: product.availableOnline, featured: product.featured, allowsPreOrder: product.allowsPreOrder }`.
- O campo `status` é uma enumeração com os valores `active`, `inactive` e `draft`. Validar com a regra `in` do pacote compartilhado e expor a enumeração como tipo no agregado.
- Os campos `availableOnline`, `featured` e `allowsPreOrder` são booleanos independentes (checkboxes no formulário). Quando ausentes na criação, assumem `false`.
- O campo `description` é opcional; quando ausente, persistir como `null`.
- O campo `price` é numérico, não-negativo (`min-value: 0`), com no máximo 2 casas decimais (regra `precision`).
- A listagem fica dentro do módulo `catalog` no front-end, em rota privada.
- **Sem verificação automatizada de UI nesta spec.** As validações automatizadas vão até a camada de backend (testes unitários do módulo + cenários no Rest Client). O usuário valida a interface manualmente.

## Tasks

### Tasks - Negócio (módulo catalog)

- [x] Criar o agregado `product` dentro do módulo `catalog` com a skill [module-aggregate](../../../.claude/skills/module-aggregate).
  > ✅ 2026-11-16 23:11 — Agregado criado com o script da skill (`--module catalog --aggregate product --mode example`) em `modules/catalog/src/product/` (`model`, `provider`, `usecase`), exportado em `modules/catalog/src/index.ts`. Decisão: a spec não diz o modo; usei `example` (só `create-product` de exemplo, como no `auth`), já que os casos de uso reais são `save-product` e `delete-product`.

- [x] Implementar a entidade `Product` com a skill [module-entity](../../../.claude/skills/module-entity), com os campos: `name` (required, min-length 2, max-length 120), `description` (max-length 500, opcional), `price` (required, min-value 0, precision 2), `status` (required, in `active|inactive|draft`), `availableOnline` (boolean, default `false`), `featured` (boolean, default `false`), `allowsPreOrder` (boolean, default `false`).
  > ✅ 2026-11-16 23:11 — `Product`/`ProductState` em `product/model/product.entity.ts`, com `PRODUCT_STATUSES` e o tipo `ProductStatus` (`active|inactive|draft`) expostos no agregado. Regras: `name` Required + MinLength(2) + MaxLength(120); `description` MaxLength(500), opcional (getter devolve `null`); `price` Required + MinValue(0) + Precision(2); `status` Required + In(PRODUCT_STATUSES); `availableOnline`/`featured`/`allowsPreOrder` com getters que devolvem `false` quando ausentes. Validação lazy em `validate()`. Desvio: não havia regra de booleano no `shared` e um valor não booleano chegaria ao Prisma (500); criei `BooleanRule` em `packages/shared/src/validation/rules/boolean.rule.ts` (código `boolean`, exportada no barrel, com 3 testes; `shared` com 99 testes). `product.entity.test.ts` com 100% de cobertura.

- [x] Definir o contrato do repositório de `product` com a skill [module-repository](../../../.claude/skills/module-repository).
  > ✅ 2026-11-16 23:11 — `ProductRepository` em `product/provider/product.repository.ts` estendendo `CrudRepository<Product, Product, Product, ProductPageParams>` (com `ProductPageParams { page, perPage }`), sem métodos extras. Fake funcional `FakeProductRepository` em `test/mock/fake-product.repository.ts` (Map em memória, `findPage` com `PageResult`, `update` falha se não existir), exportada em `test/mock/index.ts` e com teste próprio.

- [x] Implementar o caso de uso `save-product` com a skill [module-use-case](../../../.claude/skills/module-use-case). A decisão entre criar e atualizar deve ser baseada em uma consulta ao repositório (`findById`): se `id` vier na entrada e `findById` retornar um registro, executa atualização; caso contrário (sem `id` ou registro não encontrado), executa criação usando o `id` recebido ou gerando um novo.
  > ✅ 2026-11-16 23:11 — `SaveProduct` em `product/usecase/save-product.usecase.ts`, retorno `void`. Com `id` e `findById` encontrando o registro → atualiza via `clone` (preserva `id`/`createdAt`); sem `id` ou não encontrado → cria com o `id` recebido ou um novo. Na criação, booleanos ausentes viram `false` e descrição ausente vira `null`. Nome e descrição têm espaços das pontas removidos, e descrição vazia vira `null`. Na atualização, descrição e booleanos ausentes mantêm o valor atual. A validação fica centralizada na entidade (`validate()` antes de persistir).

- [x] Implementar o caso de uso `delete-product` com a skill [module-use-case](../../../.claude/skills/module-use-case). Lançar `DomainError("product.not_found", 404)` quando o `id` não existir.
  > ✅ 2026-11-16 23:11 — `DeleteProduct` em `product/usecase/delete-product.usecase.ts`, retorno `void`: `findById` → `DomainError("product.not_found", 404)` se não existir → `repository.delete(id)`. Ambos exportados no barrel de `usecase/`.

- [x] Cobrir os dois casos de uso com testes unitários, usando os fakes do módulo (`FakeProductRepository` e demais providers necessários).
  > ✅ 2026-11-16 23:11 — `save-product.usecase.test.ts` (16 casos: criar com e sem id, defaults de booleanos e descrição, descrição vazia/espaços/nula → null, trim, erros acumulados sem persistir, id não UUID; atualizar preservando `createdAt`, manter descrição e booleanos ausentes, limpar descrição, dados inválidos sem alterar) e `delete-product.usecase.test.ts` (2 casos), usando `FakeProductRepository`. `save-product`, `delete-product` e `product.entity` com 100% de statements/branches/funções/linhas; módulo `catalog` com 44 testes passando.

### Tasks - Back-end

- [x] Sincronizar o módulo `catalog` com o Prisma criando/atualizando o model da entidade `product` com a skill [backend-prisma-sync-module](../../../.claude/skills/backend-prisma-sync-module).
  > ✅ 2026-11-16 23:11 — `apps/backend/prisma/models/catalog.model.prisma` com o model `Product` (`@@map("products")`) e o enum `ProductStatus` (`@@map("product_status")`); `description` opcional, booleanos com default `false`, `price` como `Decimal(12,2)` (dinheiro com 2 casas, alinhado ao `precision 2`). Migration `20261117020722_catalog` aplicada no Postgres do Docker; SQL revisado (só CREATE TYPE/CREATE TABLE, nada destrutivo); client gerado.

- [x] Implementar o repositório Prisma de `product` em `apps/backend/src/modules/catalog` com a skill [backend-prisma-repository](../../../.claude/skills/backend-prisma-repository), sem alterar a interface definida no módulo.
  > ✅ 2026-11-16 23:11 — `PrismaProductRepository` em `apps/backend/src/modules/catalog/product.prisma.ts` (raiz do módulo, sem subpasta), implementando `create`, `update`, `delete`, `findById` e `findPage` com `PrismaService`, sem alterar a interface. O `Decimal` do banco é convertido para `number` no `toDomain`. `CatalogModule` importa `DbModule` e registra/exporta a classe.

- [x] Criar/atualizar `apps/backend/src/modules/catalog/product.controller.ts` com a skill [backend-nest-controller](../../../.claude/skills/backend-nest-controller), expondo o CRUD em `/products` (criar, atualizar, excluir, obter por id e listar paginado). Endpoints autenticados. Consultas chamam o repositório direto; comandos instanciam o caso de uso correspondente no corpo do método.
  > ✅ 2026-11-16 23:11 — `ProductController` em `/products`, registrado no `CatalogModule`, sem `@Public()` (guard JWT global): `POST` (cria, devolve `{ id }`), `PUT /:id` (204), `DELETE /:id` (204), `GET /:id` e `GET ?page&perPage` (padrão 1/10, `perPage` limitado a 100). Comandos instanciam `SaveProduct`/`DeleteProduct` no corpo do método; consultas chamam o repositório. Respostas montadas explicitamente com os 8 campos da spec. Decisão: o `PUT` em id inexistente consulta o repositório e responde 404 `product.not_found`, como a spec pede no `.http` (sem isso o `save-product` criaria um novo); o `POST` gera o UUID para devolvê-lo.

- [x] Criar `apps/backend/src/modules/catalog/product.integration.http` (Rest Client) cobrindo os fluxos do CRUD, incluindo os principais casos de erro (nome inválido, preço negativo, status fora do enum, produto inexistente em update/delete). Validar manualmente com o backend rodando.
  > ✅ 2026-11-16 23:11 — `product.integration.http` com 21 requisições: prepara e autentica um usuário; sem token (401); criar completo e mínimo (201), obter (o mínimo volta com `description: null` e os três booleanos `false`), listar; nome inválido, preço negativo, preço com 3 casas, status fora da enumeração, obrigatórios ausentes + booleano inválido (422); atualizar (204) e conferir (descrição vazia vira `null`); atualizar com dados inválidos (422); atualizar, obter e excluir inexistente, e obter excluído (404 `product.not_found`). Executado o próprio arquivo contra o backend real com o executor de cenários (variáveis, `# @name`, `{{req.response.body.x}}`, comparação com o "Esperado"): 21/21 OK. Desvio: não foi aberto pela extensão Rest Client. Dados de teste removidos.

### Tasks - Front-end

> ⚠️ Sem validação automatizada de UI. O agente entrega o código + `npx tsc --noEmit` limpo; a verificação visual é manual.

- [x] Criar a listagem paginada de `products` no módulo `catalog`, em rota privada. Tabela com as colunas nome, preço, status e ações (ícones de editar e excluir).
  > ✅ 2026-11-16 23:11 — Rota privada `/catalog/products` (`app/(private)/catalog/products/page.tsx`, com `instant = false` como as demais privadas) → `modules/catalog/pages/product-list.page.tsx` + `ProductTable` (`components/product-table.component.tsx`): colunas Nome, Preço (BRL via `Intl.NumberFormat`), Status (badge com rótulo i18n) e Ações, em `TableCard` com `PaginationControls` (10 por página). `fetch` nativo com o token do `useAuth()`, por `util/product-api.util.ts`; erros via `useApiErrorHandler` (401 encerra a sessão), agora exportado pelo barrel de `@/modules/auth` junto com `ApiError`/`toApiError`. Sem verificação automatizada de UI, conforme a spec.

- [x] Criar o formulário de `product` compartilhado entre criação e edição, organizado em seções via [`form-section-layout`](../../../apps/frontend/src/shared/components/ui/form-section-layout.tsx): "Dados básicos" (nome, descrição), "Preço e status" (preço, status como `select` com as opções `active`, `inactive`, `draft`) e "Disponibilidade" (checkboxes `availableOnline`, `featured`, `allowsPreOrder`).
  > ✅ 2026-11-16 23:11 — `ProductForm` (`components/product-form.component.tsx`), usado em `/catalog/products/new` e `/catalog/products/[id]` via `ProductFormPage`, em três `FormSectionLayout`: "Dados básicos" (nome, descrição em `Textarea`), "Preço e status" (preço `number` com `step=0.01`; status em `select` com `active`, `inactive` e `draft`, rótulos traduzidos, padrão `draft`) e "Disponibilidade" (`Checkbox` do `shared` para `availableOnline`, `featured` e `allowsPreOrder`, sempre enviados como booleanos). Edição carrega o produto com skeleton; sucesso → toaster e volta à lista. Decisões: não há `Select` no `shared`, então usei `<select>` nativo com o estilo do `Input`; a rota `[id]` é Server Component com o trecho client em `pages/product-edit.page.tsx`, pela restrição do `instant`.

- [x] Integrar a coluna de ações: lápis navega para a edição; lixeira abre [`delete-confirmation-dialog`](../../../apps/frontend/src/shared/components/ui/delete-confirmation-dialog.tsx) e, ao confirmar, chama o backend e atualiza a tabela.
  > ✅ 2026-11-16 23:11 — Lápis é um `Link` para `/catalog/products/{id}`; lixeira abre o `DeleteConfirmationDialog` (exige digitar "excluir"), que ao confirmar chama `DELETE /products/{id}`, mostra toaster `PRODUCT_DELETED` e recarrega a tabela (volta uma página se excluir o último item de uma página > 1).

- [x] Adicionar o item "Produtos" no menu lateral apontando para a listagem de `products`.
  > ✅ 2026-11-16 23:11 — Novo módulo "Produtos" (ícone `Package`) em `APP_MODULES` de `app/(private)/layout.tsx`, com a seção "Catálogo" e o item "Produtos" apontando para `/catalog/products` (`match: 'prefix'`).

- [x] Acrescentar no i18n as chaves novas que aparecerem (ex.: `product.not_found`, rótulos de status `product.status.active|inactive|draft` e mensagens específicas de validação dos novos campos). Reaproveitar as chaves já cadastradas em specs anteriores.
  > ✅ 2026-11-16 23:11 — Adicionadas em `messages.pt.ts` e `messages.en.ts`: `product.not_found`; rótulos `product.status.active|inactive|draft`; validações `product.name.required|min.length|max.length`, `product.description.max.length`, `product.price.required|min.value|precision`, `product.status.required|in` e `product.availableOnline|featured|allowsPreOrder.boolean`; mensagens `PRODUCT_SAVED` e `PRODUCT_DELETED`. Reaproveitadas `DEFAULT_API_ERROR` e o tratamento de erro do `auth`.

- [x] Rodar `npx tsc --noEmit` em `apps/frontend` e sinalizar ao usuário que a UI está pronta para conferência manual.
  > ✅ 2026-11-16 23:11 — `npx tsc --noEmit` em `apps/frontend` sem erros; ESLint sem avisos; `next build` OK com `/catalog/products`, `/catalog/products/new` e `/catalog/products/[id]`; `turbo run build lint check-types test` com 13/13 tarefas OK. **A UI está pronta para conferência manual**: com backend (4000) e frontend (3000) no ar, entrar em `/join`, abrir "Produtos" no menu e testar listar, paginar, criar (com e sem descrição e checkboxes), editar (incluindo status e checkboxes) e excluir com confirmação.

## Resultado Esperado

- Agregado `product` com entidade validada, repositório contratado e casos de uso `save-product` e `delete-product` implementados e testados.
- Model `product` sincronizado no Prisma com migration aplicada.
- CRUD de `product` exposto no backend via `ProductController`, com cenários cobertos no `product.integration.http`.
- Listagem paginada, formulário compartilhado entre criação e edição (com seções de dados básicos, preço/status e checkboxes de disponibilidade) e exclusão com confirmação funcionando no front-end, acessíveis pelo item "Produtos" do menu lateral.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
