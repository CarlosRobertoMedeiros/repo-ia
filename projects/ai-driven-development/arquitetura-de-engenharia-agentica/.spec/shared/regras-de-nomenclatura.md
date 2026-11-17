# Regras de Nomenclatura

Convenções globais de nomes de arquivos e diretórios. Podem ser referenciadas por qualquer spec.

## Regra geral

- nomes de arquivos e diretórios em `kebab-case`, sempre minúsculas
- nomes devem indicar **responsabilidade**, não implementação
- quando fizer sentido, o sufixo deve explicitar o papel do arquivo
- não usar `PascalCase`, `camelCase` ou mistura de maiúsculas em diretórios

Exemplos de diretórios válidos: `shared`, `pages`, `examples`, `customer-settings`.

## Sufixos recomendados

| Sufixo            | Uso                                                               |
| ----------------- | ----------------------------------------------------------------- |
| `*.entity.ts`     | entidades de domínio                                              |
| `*.vo.ts`         | value objects                                                     |
| `*.repository.ts` | contratos ou implementações de repositório                        |
| `*.use-case.ts`   | casos de uso                                                      |
| `*.service.ts`    | serviços de domínio ou serviços do Nest                           |
| `*.provider.ts`   | interfaces (portas)                                               |
| `*.controller.ts` | controllers                                                       |
| `*.middleware.ts` | middlewares                                                       |
| `*.guard.ts`      | guards                                                            |
| `*.factory.ts`    | fábricas para clientes, adapters, instâncias ou objetos complexos |
| `*.config.ts`     | arquivos de configuração                                          |
| `*.types.ts`      | tipos auxiliares                                                  |
| `*.page.tsx`      | páginas                                                           |
| `*.component.tsx` | componentes                                                       |
| `*.context.tsx`   | contextos React e hooks associados                                |
| `*.provider.tsx`  | providers de composição, wrappers globais, integração de runtime  |
| `*.hook.ts`       | hooks                                                             |
| `*.store.ts`      | stores                                                            |
| `*.spec.ts`       | testes automatizados                                              |

### Exemplos aplicados

- `user.repository.ts`
- `subscription.entity.ts`
- `email.vo.ts`
- `login.use-case.ts`
- `auth.controller.ts`
- `role-authorization.middleware.ts`
- `login.page.tsx`
- `customer-form.component.tsx`
- `toast.context.tsx`
- `use-auth.hook.ts`
- `session.store.ts`
- `app.providers.tsx`
- `menu.types.ts`
- `app.config.ts`
- `api-client.factory.ts`

## Exceções controladas

Nomes exigidos por ferramentas ou convenções externas mantêm o formato original. Exemplos: `README.md`, `SKILL.md`, `package.json`, `tsconfig.json`, `spec.md`.

Fora dessas exceções, prefira sempre `kebab-case`.

## Regra de decisão

Se um nome estiver ambíguo, prefira a forma que deixe mais claro:

- o que o arquivo representa
- em que camada ele vive
- qual a responsabilidade principal
