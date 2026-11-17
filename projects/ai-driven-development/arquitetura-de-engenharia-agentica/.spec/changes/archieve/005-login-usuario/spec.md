# 005-login-usuario

## Objetivo

Concluir a autenticação do módulo `auth`: implementar o caso de uso `login-user` no módulo de negócio (retornando apenas dados do usuário, sem qualquer noção de token), gerar o JWT na camada de back-end a partir do retorno do caso de uso, integrar o formulário de login do front-end ao endpoint, manter a sessão em cookie via biblioteca dedicada e proteger as rotas privadas com um guard que consome um contexto de autenticação no front-end.

## Contexto Técnico

- Módulo de negócio: `auth`, agregado `user` (já existente). Reaproveitar `UserRepository` e `CryptoProvider`. **O módulo de negócio não conhece JWT, token, sessão nem qualquer detalhe de transporte HTTP** — token é responsabilidade exclusiva da camada de back-end (API REST).
- Caso de uso `login-user` recebe `{ email, password }` e devolve apenas `{ id, name, email }` (sem `password` e sem `passwordHash`). Em credenciais inválidas, lança `DomainError`.
- Backend NestJS expõe `POST /auth/login`. O controller injeta `UserRepository` e `CryptoProvider`, instancia `LoginUser` no corpo do método, recebe o usuário retornado e — já fora do caso de uso, na camada do controller — gera o JWT com a saída do caso de uso como payload, devolvendo `{ token, user: { id, name, email } }`.
- Front-end Next.js cria contexto e guard dentro do módulo de autenticação (`apps/frontend/src/modules/auth`). Sessão persistida em cookie via `js-cookie` para sobreviver ao fechamento do navegador.
- Dados do usuário logado (nome, e-mail) consumidos no `AdminShell` (dropdown do header) através do contexto, com decode UTF-8 correto do JWT para preservar acentuação.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- O módulo de negócio (`modules/auth`) **não pode** importar, mencionar ou criar abstrações relacionadas a token/JWT/sessão. Nada de `TokenProvider` no domínio. A saída do caso de uso é estritamente os atributos públicos do usuário.
- A geração do JWT é feita **somente** no `auth.controller.ts` do backend, a partir da saída de `LoginUser`. O caso de uso não recebe nem retorna token.
- No `auth.controller.ts`, o caso de uso `login-user` deve ser instanciado no corpo do método, recebendo os providers/repositórios injetados via construtor do controller.
- O segredo do JWT vem de `JWT_SECRET` em `apps/backend/.env` e `apps/backend/.env.example`. Tempo de expiração padrão: 7 dias.
- No payload do JWT incluir apenas `sub` (id), `name` e `email`. Não incluir senha nem hash.
- O front-end **não** deve usar `atob` cru para decodificar o payload do JWT — usar `TextDecoder('utf-8')` sobre a base64url decodificada para preservar acentuação (ex.: `José` permanece `José`).
- Cookie de sessão: nome `auth_token`, atributos `sameSite: 'lax'`, `secure` em produção, `expires: 7` dias. Não usar `httpOnly` (o cookie precisa ser lido pelo client para reidratar o contexto).
- O contexto de autenticação (`AuthContext`) e o `AuthGuard` ficam em `apps/frontend/src/modules/auth/context` e `apps/frontend/src/modules/auth/guard`. Ambos exportados pelo barrel do módulo.
- O `AuthGuard` envolve o layout do grupo `(private)`. Enquanto o contexto está hidratando do cookie, renderizar um placeholder neutro (sem flash de conteúdo). Sem token válido → redirecionar para `/join`.
- Em `/join`, ao detectar sessão ativa via contexto, redirecionar automaticamente para a área administrativa (rota inicial `/example/dashboard`).
- Não criar nova biblioteca de chamada HTTP — manter `fetch` nativo, padrão da spec 004.

## Tasks

### Tasks - Negócio (módulo auth)

- [x] Implementar o caso de uso `login-user` com a skill [module-use-case](../../../.claude/skills/module-use-case). Entrada: `{ email, password }`. Saída: `{ id: string; name: string; email: string }` — apenas atributos públicos do usuário, **sem `password` e sem hash**. Fluxo: validar entrada (`email` com `RequiredRule` + `EmailRule`; `password` com `RequiredRule`), buscar usuário por e-mail, comparar a senha via `CryptoProvider.comparePassword`. Em credenciais inválidas (usuário não encontrado **ou** senha incorreta), lançar `DomainError('user.credentials.invalid', 401)` — mesma mensagem para os dois casos, para não vazar quais e-mails existem. O caso de uso **não conhece nem menciona token/JWT**.
  > ✅ 2026-11-16 22:21 — `LoginUser` em `modules/auth/src/user/usecase/login-user.usecase.ts` (exportado no barrel). Entrada `{ email, password }`, saída `{ id, name, email }`. Fluxo: valida (`email`: Required + Email; `password`: Required) → busca por e-mail normalizado (trim + minúsculas) → compara a senha → `DomainError('user.credentials.invalid', 401)` tanto para usuário inexistente quanto para senha incorreta. `grep` por token/jwt/session/sessão em `modules/auth/src` não encontra nada. Desvio: a spec cita `CryptoProvider.comparePassword`, mas a interface criada na spec 002 (e que não pode ser alterada) chama `compare`; usado `compare`.


- [x] Cobrir o caso de uso com testes unitários reaproveitando os fakes existentes (`FakeUserRepository`, `FakeCryptoProvider`). Cenários mínimos: login válido devolvendo `{ id, name, email }` sem `password`, e-mail inexistente, senha incorreta, e-mail vazio, e-mail inválido, senha vazia. Coverage 100% no caso de uso.
  > ✅ 2026-11-16 22:21 — `test/user/usecase/login-user.usecase.test.ts`, 9 casos: login válido (saída só com `id`/`name`/`email`, sem `password`), normalização do e-mail, e-mail inexistente (401, `compare` não chamado), senha incorreta (401), mesma mensagem/status nos dois casos de falha, e-mail vazio, e-mail inválido, senha vazia (422, sem consultar dependências) e erros acumulados. `login-user.usecase.ts` com 100% de statements/branches/funções/linhas; módulo `auth` com 36 testes passando. Desvio: o `FakeCryptoProvider` não verificava a senha (`compare` ignorava o conteúdo) e foi tornado fiel, com hash determinístico no formato bcrypt derivado da senha; os testes de `register-user` continuam passando.


### Tasks - Back-end

- [x] Instalar `jsonwebtoken` e `@types/jsonwebtoken` no workspace `@sdd/backend`. Adicionar `JWT_SECRET` em `apps/backend/.env` e `apps/backend/.env.example` (valor de exemplo seguro, com aviso para troca em produção).
  > ✅ 2026-11-16 22:21 — `jsonwebtoken@^9` e `@types/jsonwebtoken@^9` instalados em `@sdd/backend`. `JWT_SECRET` já existia vazio no `.env.example`: agora tem valor de exemplo com aviso para trocar em produção (e como gerar um segredo aleatório). No `.env` local (ignorado pelo git) foi gerado um segredo aleatório de 48 bytes no lugar do `dev-secret-change-me`.

- [x] Criar um helper local `jwt.util.ts` diretamente em `apps/backend/src/modules/auth` com a função `signUserToken(user: { id: string; name: string; email: string }, secret: string): string`. A função monta o payload `{ sub, name, email }` e assina com expiração `14d`. Esse helper é exclusivo da camada HTTP — **não** é um provider de domínio nem é exportado para o módulo de negócio.
  > ✅ 2026-11-16 22:21 — `apps/backend/src/modules/auth/jwt.util.ts` com `signUserToken(user, secret)`, payload `{ sub, name, email }`, usado só pela camada HTTP (não é provider nem é exportado ao módulo de negócio). Desvio: a task diz expiração `14d`, mas as Observações Locais e o cookie falam em 7 dias; adotei **7d** (validado: `exp - iat` = 7 dias) para o token valer o mesmo que o cookie. Basta trocar `TOKEN_EXPIRES_IN` se 14d for o desejado.

- [x] Atualizar `auth.controller.ts` adicionando o endpoint `POST /auth/login` (público, mesmo padrão de `/auth/register`): injetar `UserRepository`, `CryptoProvider` e `ConfigService`, instanciar `LoginUser` no corpo do método, executar e — com a saída `{ id, name, email }` em mãos — chamar `signUserToken` para gerar o JWT. Retorno 200 com `{ token, user: { id, name, email } }`.
  > ✅ 2026-11-16 22:21 — `POST /auth/login` (`@Public()`, `@HttpCode(200)`) em `auth.controller.ts`: injeta `PrismaUserRepository`, `BcryptCryptoProvider` e `ConfigService`, instancia `LoginUser` no corpo do método e, com a saída em mãos, chama `signUserToken` (`JWT_SECRET` via `getOrThrow`). Retorna `{ token, user: { id, name, email } }`. Validado contra o backend real: 200 no login válido; token com assinatura válida pelo `JWT_SECRET`, payload só com `sub/name/email/iat/exp`, `name` "José da Conceição" preservado; assinatura rejeitada com outro segredo.

- [x] Estender `auth.integration.http` com cenários de login: credenciais válidas (200, devolve `token` e `user`), e-mail inexistente (401), senha incorreta (401), e-mail inválido (422), corpo incompleto (422). Validar manualmente via Rest Client com o backend rodando.
  > ✅ 2026-11-16 22:21 — Cenários 7 a 11 acrescentados a `auth.integration.http`: login válido (200 com `token` e `user`), e-mail inexistente (401), senha incorreta (401), e-mail inválido (422) e corpo incompleto (422). Executados contra o backend real: 200; 401 `user.credentials.invalid` (idêntico nos dois casos); 422 `user.email.invalid.email`; 422 `user.email.required` + `user.password.required`; e login com e-mail em caixa alta também retorna 200. Desvio: executado por script Node (`fetch`), não pela extensão Rest Client. Obs.: o `curl` do Git Bash no Windows envia o corpo em ANSI e quebrava o nome acentuado (falso `person.name`); com UTF-8 de verdade o cadastro funciona.
  
### Tasks - Front-end

- [x] Instalar `js-cookie` e `@types/js-cookie` no workspace `@sdd/frontend`.
  > ✅ 2026-11-16 22:21 — `js-cookie@^3` e `@types/js-cookie@^3` instalados em `@sdd/frontend`.

- [x] Adicionar a chave de erro `user.credentials.invalid` em `apps/frontend/src/shared/i18n/messages.pt.ts` e `messages.en.ts`, com mensagem genérica ("E-mail ou senha inválidos." / "Invalid email or password.").
  > ✅ 2026-11-16 22:21 — Chave adicionada em `messages.pt.ts` ("E-mail ou senha inválidos.") e `messages.en.ts` ("Invalid email or password."). Removida a chave `AUTH_LOGIN_COMING_SOON`, criada na spec 004 para o login provisório e agora sem uso.
  
- [x] Criar `apps/frontend/src/modules/auth/util/jwt.util.ts` com a função `decodeJwtPayload(token: string): { sub: string; name: string; email: string } | null`. Usar base64url → `Uint8Array` → `TextDecoder('utf-8')` para garantir acentuação correta no `name`. Cobrir com teste unitário simples (ou validar manualmente com um token contendo `José da Silva` e registrar evidência).
  > ✅ 2026-11-16 22:21 — `decodeJwtPayload(token)` em `modules/auth/util/jwt.util.ts`: base64url → `Uint8Array` → `TextDecoder('utf-8')`. Devolve `null` para token malformado, sem `sub/name/email` ou expirado (acréscimo ao pedido: com `exp` vencido a sessão não é reidratada). Comentário no código deixa claro que não valida a assinatura. Testes (`node:test`, 6 casos, rodados a partir do scratchpad, pois o frontend não tem test runner): "José da Silva" preservado, "Conceição 🙂" preservado, `atob` cru de fato corrompe o acento (justifica o TextDecoder), expirado → null, campos ausentes → null, malformados → null. 6/6 OK.
  
- [x] Criar `AuthContext` em `apps/frontend/src/modules/auth/context/auth.context.tsx`:
  - Estado: `user: { id: string; name: string; email: string } | null`, `token: string | null`, `status: 'loading' | 'authenticated' | 'unauthenticated'`.
  - Na montagem: ler cookie `auth_token`, decodificar via `decodeJwtPayload`, hidratar estado. Se inválido/ausente → `unauthenticated`.
  - API exposta: `login(token: string)` (grava cookie, hidrata estado), `logout()` (remove cookie, limpa estado).
  - Hook `useAuth()` para consumo.
  > ✅ 2026-11-16 22:21 — `modules/auth/context/auth.context.tsx` com `AuthProvider` e `useAuth()`: estado `user`, `token` e `status` (`loading`/`authenticated`/`unauthenticated`), `login(token)` grava o cookie `auth_token` (`expires: 7`, `sameSite: 'lax'`, `secure` em produção, sem `httpOnly`) e `logout()` remove. Decisão: o cookie é lido com `useSyncExternalStore` (servidor e hidratação começam em `loading`) em vez de `setState` num `useEffect`, que a regra `react-hooks` do lint reprova e que causaria um render extra. `useAuth` fora do provider lança erro.
  
- [x] Criar `AuthGuard` em `apps/frontend/src/modules/auth/guard/auth.guard.tsx`:
  - Enquanto `status === 'loading'` → renderizar placeholder neutro (`null` ou skeleton mínimo).
  - Se `unauthenticated` → `router.replace('/join')` e renderizar `null`.
  - Se `authenticated` → renderizar `children`.
  > ✅ 2026-11-16 22:21 — `modules/auth/guard/auth.guard.tsx`: `loading` → `null`; `unauthenticated` → `router.replace('/join')` e `null`; `authenticated` → `children`. Contexto, guard e util exportados por `modules/auth/index.ts`.
 

- [x] Envolver o layout de `app/(private)/layout.tsx` com `<AuthProvider>` (movido do layout raiz se necessário) e `<AuthGuard>`. Substituir os valores hardcoded `userName`/`userEmail` no `AdminShell` pelos dados do `useAuth()`. O `onLogout` deve chamar `auth.logout()` e em seguida `router.push('/join')`.
  > ✅ 2026-11-16 22:21 — `(private)/layout.tsx` agora envolve o `AdminShell` com `<AuthGuard>`; `userName`/`userEmail` vêm de `useAuth().user` (antes eram os padrões fixos do shell); `onLogout` chama `logout()` e `router.push('/join')`. O `AuthProvider` fica no layout raiz (task seguinte).


- [x] Garantir que o `AuthProvider` cubra também o grupo `(public)` — mover o provider para o `app/layout.tsx` raiz (ou criar layout pai apropriado), de forma que tanto a tela de login quanto a área privada compartilhem o mesmo contexto.
  > ✅ 2026-11-16 22:21 — `AuthProvider` montado uma única vez em `app/layout.tsx`, envolvendo `TooltipProvider` e `Toaster`; `(public)` e `(private)` compartilham o mesmo contexto.


- [x] Integrar o formulário de **login** em `apps/frontend/src/modules/auth/components/auth.component.tsx`:
  - `POST {NEXT_PUBLIC_API_URL}/auth/login` com `{ email, password }`.
  - Em sucesso (200): chamar `auth.login(response.token)` e `router.push('/example/dashboard')`. Disparar `toast.success` opcional.
  - Em erro: parsear `ApiErrorResponse`, iterar `errors[]` e disparar um `toast.error(getMessage(code))` por item (mesmo padrão do cadastro).
  > ✅ 2026-11-16 22:21 — `LoginForm` implementado em `modules/auth/components/auth.component.tsx` (export nomeado; o export default `AuthComponent` da rota `/auth` foi mantido). `fetch` nativo para `${NEXT_PUBLIC_API_URL}/auth/login`; 200 → `login(token)` + `router.push('/example/dashboard')`; erro → um `toast.error(getMessage(code))` por item de `errors[]`; falha de rede ou resposta sem token → `DEFAULT_API_ERROR`. Sem toast de sucesso (opcional na spec). O `login-form.component.tsx` provisório da spec 004 foi removido de `join/` e a página passou a importar o `LoginForm` do módulo.
  
- [x] Em `app/(public)/join/page.tsx` (ou na própria `auth.page.tsx`/`auth.component.tsx`), detectar sessão ativa via `useAuth()` e redirecionar automaticamente para `/example/dashboard` quando `status === 'authenticated'`. Enquanto `status === 'loading'`, não renderizar formulário (evitar flash).
  > ✅ 2026-11-16 22:21 — `join/page.tsx` usa `useAuth()`: `authenticated` → `router.replace('/example/dashboard')`; enquanto `status !== 'unauthenticated'` (hidratando ou redirecionando) não renderiza o formulário. Validado no navegador, sem flash (ver task seguinte).


- [x] Validar manualmente no navegador e registrar evidência:
  - Login com credenciais válidas → cookie `auth_token` presente, redirecionamento para `/example/dashboard`, dropdown do header exibindo `name` e `email` do usuário (incluindo um caso com acentuação, ex.: cadastrar e logar `José da Conceição`).
  - Login com senha errada → toaster "E-mail ou senha inválidos.", sem cookie gravado.
  - Recarregar a página em `/example/dashboard` após login → permanece autenticado, sem flash de tela pública.
  - Fechar e reabrir o navegador → sessão preservada (cookie sobrevive).
  - Acessar `/example/dashboard` deslogado → redireciona para `/join`.
  - Acessar `/join` logado → redireciona para `/example/dashboard`.
  - Clicar em "Logout" no dropdown → cookie removido, redireciona para `/join`.
  - `npx tsc --noEmit` sem erros novos.
  > ✅ 2026-11-16 22:21 — Validado em navegador real (Microsoft Edge headless via puppeteer-core instalado fora do projeto; `next start` na 3000 + backend na 4000 + Postgres do Docker), 7/7 cenários OK, usando "José da Conceição" cadastrado pela própria UI: (1) login válido → cookie `auth_token` (SameSite=Lax, Secure, sem httpOnly, expira em 7 dias, não é cookie de sessão), URL `/example/dashboard` e dropdown exibindo "José da Conceição" e o e-mail; (2) senha errada → 1 toaster "E-mail ou senha inválidos.", sem cookie, permanece em `/join`; (3) recarregar em `/example/dashboard` → continua autenticado, e um MutationObserver instalado desde o início do documento não viu a tela pública; (4) fechar o Edge e reabrir com o mesmo perfil → cookie persistido, dashboard abre autenticado, sem flash da tela pública; (5) deslogado em `/example/dashboard` → vai para `/join`, sem expor conteúdo privado; (6) logado em `/join` → vai para `/example/dashboard`, sem mostrar o formulário; (7) Logout no dropdown → cookie removido, `/join`, e o dashboard volta a redirecionar. `npx tsc --noEmit` no frontend sem erros; `turbo run build lint check-types test` com 11/11 tarefas OK; nenhum erro nos logs do frontend e do backend. Dados de teste removidos do banco. Capturas (temporárias) no scratchpad da sessão, em e2e/l1-senha-errada.png, l2-dashboard-menu.png e l3-apos-logout.png. Desvio: execução automatizada, não manual por pessoa.
  
## Resultado Esperado

- Caso de uso `login-user` no módulo `auth` retornando apenas `{ id, name, email }`, sem qualquer referência a token/JWT, com testes cobrindo credenciais válidas e inválidas.
- Endpoint `POST /auth/login` no backend gerando o JWT a partir da saída do caso de uso, assinado com `JWT_SECRET` e payload mínimo (`sub`, `name`, `email`).
- Sessão de usuário no front-end persistida em cookie via `js-cookie`, sobrevivendo ao fechamento do navegador.
- `AuthContext` e `AuthGuard` no módulo `auth` do front-end, protegendo o grupo `(private)` e alimentando o dropdown do `AdminShell` com os dados do usuário logado, com acentuação correta.
- Tela `/join` redireciona automaticamente para a área administrativa quando há sessão ativa.
- Logout limpa o cookie e devolve o usuário à tela de autenticação.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
