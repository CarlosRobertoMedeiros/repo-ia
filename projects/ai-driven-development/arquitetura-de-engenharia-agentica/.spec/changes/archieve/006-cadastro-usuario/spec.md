# 006-cadastro-usuario

## Objetivo

Entregar o CRUD de usuário no módulo `auth`, servindo de referência para os próximos cadastros da aplicação.

## Contexto Técnico

- Módulo de negócio: `auth`, agregado `user` (já existente).
- Backend NestJS com controller dedicado para o CRUD.
- Front-end Next.js com listagem paginada e formulário compartilhado entre criação e edição, dentro do módulo `auth`.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- O caso de uso `save-user` cobre tanto criação quanto atualização e é **distinto** de `register-user`. Não fundir nem substituir o `register-user` existente.
- Casos de uso de comando retornam `void`. Consultas não viram caso de uso — o controller chama o repositório direto.
- Confirmação de senha é responsabilidade do front-end. Backend recebe apenas `password`.
- Em edição, se `password` vier vazio, a senha atual é mantida.
- O projeto não usa DTOs de entrada. **Respostas de leitura devem ser mapeadas para objetos simples no controller antes de retornar** — entidades de domínio usam `protected readonly props` com getters de prototype, que não serializam via `JSON.stringify` (produzem `{}`). O controller deve construir explicitamente o objeto de retorno: `return { id: user.id, name: user.name, email: user.email }`.
- A listagem fica dentro do módulo `auth` no front-end, em rota privada.
- **Sem verificação automatizada de UI nesta spec.** Não acionar `mcp__Claude_Preview` nem `mcp__Claude_in_Chrome`. As validações automatizadas vão até a camada de backend (testes unitários do módulo + cenários no Rest Client). O usuário valida a interface manualmente.

## Tasks

### Tasks - Negócio (módulo auth)

- [x] Implementar o caso de uso `save-user` com a skill [module-use-case](../../../.claude/skills/module-use-case). A decisão entre criar e atualizar deve ser baseada em uma consulta ao repositório (`findById`): se `id` vier na entrada e `findById` retornar um usuário, executa atualização; caso contrário (sem `id` ou usuário não encontrado no banco), executa criação usando o `id` recebido ou gerando um novo. Em edição sem `password` (ausente ou vazio), manter o hash atual sem re-hashear.
  > ✅ 2026-11-16 22:38 — `SaveUser` em `modules/auth/src/user/usecase/save-user.usecase.ts`, retorno `void`, distinto de `register-user` (que não foi alterado). Entrada `{ id?, name, email, password? }`. Decisão por `findById`: com `id` e usuário encontrado → atualiza (`clone` preservando `id`/`createdAt`); sem `id` ou não encontrado → cria, com o `id` recebido ou um novo. Em edição com `password` ausente ou vazia mantém o hash atual, sem `encrypt`. Validação única e acumulada (nome, e-mail e, quando não mantém a senha, Required + StrongPassword); e-mail em uso por outro usuário → `DomainError('user.email.already.registered', 409)`, permitindo manter o próprio e-mail. O domínio continua sem referência a token/JWT/sessão.


- [x] Implementar o caso de uso `delete-user` com a skill [module-use-case](../../../.claude/skills/module-use-case).
  > ✅ 2026-11-16 22:38 — `DeleteUser` em `modules/auth/src/user/usecase/delete-user.usecase.ts`, retorno `void`: busca por `findById`, lança `NotFoundError('user.not_found')` (404) se não existir e chama `repository.delete(id)` (exclusão definitiva, como o repositório Prisma já faz). Ambos exportados no barrel de `usecase/`.


- [x] Cobrir os dois casos de uso com testes unitários, reaproveitando os fakes existentes (`FakeUserRepository`, `FakeCryptoProvider`).
  > ✅ 2026-11-16 22:38 — `save-user.usecase.test.ts` (16 casos: criar sem id, com id novo, normalização, senha ausente/vazia/fraca na criação, e-mail duplicado, erros acumulados, id não UUID, e na edição: manter hash com senha ausente e vazia, novo hash, senha fraca sem alterar, manter o próprio e-mail, e-mail de outro usuário → 409, validação) e `delete-user.usecase.test.ts` (2 casos), com `FakeUserRepository` e `FakeCryptoProvider` existentes (sem alterar os fakes). `save-user`, `delete-user`, `register-user` e `login-user` com 100% de cobertura; módulo `auth` com 54 testes passando.


### Tasks - Back-end

- [x] Criar `apps/backend/src/modules/auth/user.controller.ts` com a skill [backend-nest-controller](../../../.claude/skills/backend-nest-controller), expondo o CRUD em `/users` (criar, atualizar, excluir, obter por id e listar paginado). Endpoints autenticados. Consultas chamam o repositório direto; comandos instanciam o caso de uso correspondente.
  > ✅ 2026-11-16 22:38 — `UserController` em `/users`, registrado em `AuthModule`, sem `@Public()` (protegido pelo guard JWT global): `POST /users` (cria, devolve `{ id }`), `PUT /users/:id` (204), `DELETE /users/:id` (204), `GET /users/:id` e `GET /users?page&perPage`. Comandos instanciam `SaveUser`/`DeleteUser` no corpo do método; consultas chamam o repositório direto. Leituras são mapeadas para objetos simples (`{ id, name, email }`), nunca expondo `password`; 404 de consulta via `NotFoundError('user.not_found')`. `page`/`perPage` inválidos caem nos padrões (1 e 10) e `perPage` é limitado a 100 (verificado). Decisões: o controller gera o UUID no POST para devolvê-lo (o caso de uso continua aceitando `id` recebido ou gerando um); `PUT` em id inexistente cria (semântica da spec para `save-user`).

- [x] Criar `apps/backend/src/modules/auth/user.integration.http` (Rest Client) cobrindo os fluxos do CRUD, incluindo os principais casos de erro. Validar manualmente com o backend rodando.
  > ✅ 2026-11-16 22:38 — `user.integration.http` com 22 requisições (0 a 21): prepara e autentica um usuário e captura o token; sem token e token inválido (401); criar (201 com `id`), obter, listar paginado; e-mail duplicado (409); dados inválidos e sem senha (422); atualizar mantendo a senha (204) e provar o login com a senha original; trocar a senha e provar que a antiga falha (401) e a nova entra; e-mail de outro usuário (409); senha fraca (422); obter inexistente, excluir, excluir de novo e obter excluído (404). Executei o próprio arquivo contra o backend real, com um executor que interpreta variáveis, `# @name` e `{{req.response.body.x}}` e compara cada status com o "Esperado" do comentário: 22/22 OK, incluindo `user.not_found`, `user.credentials.invalid` e a ausência de `password` nas respostas. Desvio: não foi aberto pela extensão Rest Client.


### Tasks - Front-end

> ⚠️ Sem validação automatizada de UI. O agente entrega o código + `npx tsc --noEmit` limpo; a verificação visual é manual.

- [x] Criar a listagem paginada de usuários no módulo `auth`, em rota privada. Tabela com colunas de nome, e-mail e ações (ícones de editar e excluir).
  > ✅ 2026-11-16 22:38 — Rota privada `/auth/users` (`app/(private)/auth/users/page.tsx`) → `modules/auth/pages/user-list.page.tsx`, com `UserTable` (`user-table.component.tsx`): colunas Nome, E-mail e Ações (lápis e lixeira), dentro de `TableCard` com `PaginationControls` (10 por página, total). Busca com `fetch` e token do `useAuth()`; ao excluir a última linha de uma página > 1 volta uma página. 401 em qualquer chamada encerra a sessão (hook `useApiErrorHandler`). Lista vazia mostra texto simples: o `EmptyListState` do template aponta para uma ilustração que não existe em `public/`. Sem verificação automatizada de UI, conforme a spec.


- [x] Criar o formulário de usuário compartilhado entre criação e edição, organizado em seções via [`form-section-layout`](../../../apps/frontend/src/shared/components/ui/form-section-layout.tsx): "Dados básicos" (nome, e-mail) e "Senha" (senha + confirmação).
  > ✅ 2026-11-16 22:38 — `UserForm` (`components/user-form.component.tsx`) usado por criação (`/auth/users/new`) e edição (`/auth/users/[id]`) via `UserFormPage`, em duas seções de `FormSectionLayout`: "Dados básicos" (nome, e-mail) e "Senha" (senha + confirmação). A confirmação é validada só no front (divergência → toaster `user.password.confirmation.mismatch`, sem chamar a API); em edição a senha é opcional e, vazia, não é enviada (backend mantém o hash). Demais validações ficam no backend; só `required` nos inputs. A edição carrega o usuário (skeleton enquanto carrega, volta à lista com toaster se der erro) e, ao salvar, mostra toaster de sucesso e volta à lista. A rota `[id]` é Client Component com `useParams`, o que passou no build com Cache Components.


- [x] Integrar a coluna de ações: lápis navega para a edição; lixeira abre [`delete-confirmation-dialog`](../../../apps/frontend/src/shared/components/ui/delete-confirmation-dialog.tsx) e, ao confirmar, chama o backend e atualiza a tabela.
  > ✅ 2026-11-16 22:38 — Lápis é um `Link` para `/auth/users/{id}`; lixeira abre o `DeleteConfirmationDialog` (exige digitar "excluir"), que ao confirmar chama `DELETE /users/{id}`, mostra toaster de sucesso e recarrega a tabela. Acréscimo: o usuário logado não consegue confirmar a exclusão do próprio registro (botão desabilitado com a mensagem `USER_DELETE_SELF`); isso é só da UI, o backend não bloqueia.


- [x] Adicionar o item "Usuários" no menu lateral apontando para a listagem.
  > ✅ 2026-11-16 22:38 — Novo módulo "Usuários" (ícone `Users`) no `APP_MODULES` de `app/(private)/layout.tsx`, com o item "Usuários" apontando para `/auth/users` (`match: 'prefix'`, ativo também em `/new` e `/[id]`).


- [x] Acrescentar no i18n as chaves novas que aparecerem (ex.: `user.not_found`, mensagem de senha e confirmação divergentes). Reaproveitar as chaves já cadastradas em specs anteriores.
  > ✅ 2026-11-16 22:38 — Adicionadas em `messages.pt.ts` e `messages.en.ts`: `user.not_found`, `user.password.confirmation.mismatch`, `USER_SAVED`, `USER_DELETED` e `USER_DELETE_SELF`. Reaproveitadas as chaves de validação (`user.name.*`, `user.email.*`, `user.password.*`) e `user.email.already.registered` das specs anteriores. Decisão: `user.not_found` segue literalmente o exemplo da spec (com underscore), embora os demais códigos usem pontos.

- [x] Rodar `npx tsc --noEmit` em `apps/frontend` e sinalizar ao usuário que a UI está pronta para conferência manual.
  > ✅ 2026-11-16 22:38 — `npx tsc --noEmit` em `apps/frontend` sem erros; ESLint do frontend sem avisos; `next build` OK com as rotas `/auth/users`, `/auth/users/new` e `/auth/users/[id]`; `turbo run build lint check-types test` com 11/11 tarefas OK. **A UI está pronta para conferência manual**: com backend (4000) e frontend (3000) no ar, entrar em `/join`, abrir "Usuários" no menu e testar listar, paginar, criar, editar (com e sem trocar a senha), excluir e a confirmação de senha divergente. Limitação conhecida: ao editar o próprio usuário, nome e e-mail exibidos no header só atualizam no próximo login, pois vêm do JWT já emitido. Dados de teste removidos do banco.

## Resultado Esperado

- Casos de uso `save-user` e `delete-user` implementados e testados, sem alterar `register-user` nem `login-user`.
- CRUD de usuário exposto no backend via `UserController`, com cenários cobertos no `user.integration.http`.
- Listagem paginada, formulário compartilhado e exclusão com confirmação funcionando no front-end.
- Spec serve de referência para os próximos cadastros do projeto.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
