# 004-cadastro-cliente-frontend

## Objetivo

Implementar a tela `/join` no front-end com alternância entre **cadastro** e **login**. O cadastro chama `POST /auth/register` no backend. Em sucesso ou erro, exibe toasters — um por mensagem — sem redirecionar. O login terá estrutura visual completa, sem integração funcional por enquanto.

## Contexto Técnico

- Rota existente: `app/(public)/join/page.tsx`, criada pela spec 003.
- URL base da API: variável `NEXT_PUBLIC_API_URL` definida em `apps/frontend/.env`. Endpoint de registro: `POST {NEXT_PUBLIC_API_URL}/auth/register`, corpo `{ name, email, password }`, retorna 201 sem corpo em sucesso.
- Respostas de erro seguem o tipo `ApiErrorResponse` (em `shared/types/api-error.type.ts`): campo `errors: string[]` com chaves i18n. Cada item deve gerar um toaster individual.
- O `Toaster` (sonner) já está montado em `app/layout.tsx` — basta importar `toast` de `sonner` nos componentes.
- Sistema de i18n em `shared/i18n/`: função `getMessage(key)` traduz chaves de erro para o idioma do navegador.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- Usar `fetch` nativo (sem biblioteca extra) para chamar o backend.
- Não redirecionar após o cadastro — nem em sucesso, nem em erro.
- Os campos obrigatórios do cadastro: `name`, `email` e `password`.
- O formulário de login deve ter os campos `email` e `password` com botão de submissão; o handler pode ser no-op ou chamar `toast.info('Login em breve')`.
- Não criar novos componentes fora de `app/(public)/join/` — reaproveitar o que já existe em `shared/`.
- Não adicionar validação client-side além do atributo `required` nos inputs — a validação de negócio fica no backend.

## Tasks

### Tasks - Mapeamento de erros e i18n

- [x] Ler `apps/backend/src/modules/auth/auth.integration.http` e `apps/backend/src/shared/errors/api-exception.filter.ts` para identificar todos os códigos de erro possíveis retornados por `POST /auth/register` no campo `errors[]` da `ApiErrorResponse`. Listar cada código identificado na evidência.
  > ✅ 2026-11-16 22:05 — Lidos `auth.integration.http` e `api-exception.filter.ts` e confirmado com chamadas reais ao backend (inclusive casos extremos). Códigos possíveis em `errors[]` de `POST /auth/register`: **409** `user.email.already.registered`; **422** `user.name.required`, `user.name.min.length`, `user.name.max.length`, `user.name.person.name`, `user.email.required`, `user.email.invalid.email`, `user.password.required`, `user.password.strong.password` e `user.password.bcrypt.hash` (defensivo: `user.validate()` após o hash, na prática inalcançável); **500** `INTERNAL_SERVER_ERROR` (fallback do filtro). Total: 11 códigos. Observações: (a) corpo JSON malformado devolve 400 com a mensagem crua do parser (ex.: "Unexpected end of JSON input"), que não é chave i18n e cai em `UNKNOWN_ERROR_CODE`; o formulário sempre envia JSON válido, então não ocorre pela UI; (b) corpo com `Content-Type: text/plain` devolve 500, pois o caso de uso recebe `undefined` — falha do backend fora do escopo desta spec, não alterada.

- [x] Verificar se todos os códigos identificados na task anterior estão presentes como chaves em `apps/frontend/src/shared/i18n/messages.pt.ts` e `messages.en.ts`. Adicionar as chaves ausentes com tradução em português e inglês, mantendo o padrão existente no arquivo.
  > ✅ 2026-11-16 22:05 — Nenhum dos 11 códigos existia nos dicionários (só chaves genéricas do template). Adicionadas em `messages.pt.ts` e `messages.en.ts` as 11 chaves, com o código literal como chave (entre aspas quando contém ponto), mais `AUTH_REGISTER_SUCCESS` e `AUTH_LOGIN_COMING_SOON` para os toasts da tela, evitando textos fixos só em português. O tipo `ErrorMessages` garante paridade pt/en; `tsc --noEmit` limpo.
  
### Tasks - Front-end

- [x] Substituir o conteúdo de `app/(public)/join/page.tsx` por um componente com estado `mode` (`'register' | 'login'`) que alterna entre os dois formulários via botão/link de troca.
  > ✅ 2026-11-16 22:05 — `page.tsx` virou Client Component com estado `mode` (`'register' | 'login'`, padrão cadastro) e link/botão de alternância que também troca o subtítulo. Os formulários ficaram em `join/register-form.component.tsx` e `join/login-form.component.tsx`, sem criar nada fora de `app/(public)/join/` e reaproveitando `Button`, `Input` e `Label` de `shared/`.

- [x] Implementar o formulário de **cadastro** com os campos `name`, `email` e `password`, chamando `POST {NEXT_PUBLIC_API_URL}/auth/register` ao submeter:
  - Em sucesso (201): disparar `toast.success` com mensagem de confirmação de cadastro.
  - Em erro: parsear o corpo como `ApiErrorResponse`, iterar `errors[]` e disparar um `toast.error(getMessage(code))` para cada item — um toaster por erro recebido.
  - Não redirecionar em nenhum caso.
  > ✅ 2026-11-16 22:05 — `RegisterForm` com `name`, `email` e `password`, apenas com `required` (o e-mail usa `type="text"` de propósito: `type="email"` seria validação client-side e bloquearia o cenário de e-mail inválido). `fetch` nativo para `${NEXT_PUBLIC_API_URL}/auth/register`. 201 → `toast.success(getMessage('AUTH_REGISTER_SUCCESS'))` e limpa o formulário; erro → lê `ApiErrorResponse` e dispara um `toast.error(getMessage(code))` por item de `errors[]`; corpo ausente/ilegível ou falha de rede → `DEFAULT_API_ERROR`. Botão desabilitado durante o envio e nenhum redirecionamento.

- [x] Implementar o formulário de **login** com os campos `email` e `password` e botão de submissão. O handler não precisa chamar nenhum endpoint por enquanto.
  > ✅ 2026-11-16 22:05 — `LoginForm` com `email` e `password` (ambos `required`) e botão "Entrar". O handler só dispara `toast.info(getMessage('AUTH_LOGIN_COMING_SOON'))` ("Login em breve"), sem chamar endpoint.

- [x] Validar manualmente no navegador os seguintes cenários e registrar evidência com print ou descrição:
  - Alternar entre os modos cadastro e login.
  - Submeter cadastro com dados válidos → toaster de sucesso exibido.
  - Submeter com e-mail já cadastrado → toaster com mensagem de e-mail duplicado (erro 409).
  - Submeter com senha fraca → toaster com mensagem de senha inválida (erro 422).
  - Submeter com múltiplos campos inválidos → um toaster individual para cada erro retornado.
  > ✅ 2026-11-16 22:05 — Validado em navegador real (Microsoft Edge headless, comandado por puppeteer-core instalado fora do projeto), com frontend (`next start`, 3000) e backend (4000) contra o Postgres do Docker, 6/6 cenários OK, sem redirecionar em nenhum (URL sempre `/join`): (1) alternância cadastro ↔ login: cadastro com `name/email/password`, login com `email/password`, subtítulo trocado; (2) cadastro válido → 1 toaster de sucesso "Cadastro realizado com sucesso!"; (3) mesmo e-mail de novo (409) → "Este e-mail já está cadastrado."; (4) senha `123456` (422) → "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial."; (5) nome "Al", e-mail "x", senha "1" → 4 toasters individuais e distintos (senha forte, e-mail inválido, nome e sobrenome, nome com mínimo de 3), empilhados pelo sonner e expandidos ao passar o mouse; (6) login → toast info "Login em breve". No banco, a senha ficou como hash bcrypt (`$2b$10$`, 60 caracteres). Dados de teste removidos. Capturas de tela (temporárias, não versionadas) no scratchpad da sessão, em e2e/1-cadastro.png até e2e/6-multiplos.png. Desvio: execução automatizada por script, não manual por pessoa. Verificação final: `turbo run build lint check-types test` com 11/11 tarefas OK e nenhum erro no log do `next start`.
 
## Resultado Esperado

- Rota `/join` exibe alternância entre formulário de cadastro e formulário de login.
- Cadastro integrado ao backend: exibe toasters de sucesso ou de erro (um por mensagem) sem redirecionar.
- Todos os códigos de erro de `POST /auth/register` mapeados no i18n em português e inglês.
- Login com estrutura visual completa, sem integração funcional.
- Sem erros de TypeScript ou de build após as alterações.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
