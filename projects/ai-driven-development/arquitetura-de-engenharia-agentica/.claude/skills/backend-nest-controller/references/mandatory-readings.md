# Leituras Obrigatorias

Leia estes arquivos antes de criar ou atualizar qualquer controller com esta skill:

1. `apps/backend/src/modules/auth/auth.controller.ts`
2. `apps/backend/src/modules/auth/auth.module.ts`
3. `apps/backend/src/modules/auth/auth.integration.http`
4. O caso de uso alvo dentro de `modules/<modulo>/src/**/usecase/*.usecase.ts`
5. O `index.ts` do agregado correspondente
6. O `index.ts` do modulo correspondente
7. `apps/backend/src/app.module.ts`

Depois das leituras base acima, localizar e ler a infraestrutura compartilhada do backend relacionada a autenticacao e tratamento de erros, se existir, como por exemplo:

- `apps/backend/src/shared/**`
- filtros globais
- guards
- decorators
- utilitarios de autenticacao
- `apps/backend/src/main.ts`, quando ele influenciar filtros, pipes ou bootstrap relevante

Busca sugerida:

```bash
rg -n --hidden -S "CurrentUser|currentUser|request.user|req.user|jwt|token|Bearer|Authorization|AuthGuard|UseGuards|guard|decorator|filter|exception|DomainError|ValidationException" apps/backend/src modules packages/shared --glob '!**/node_modules/**'
```

Objetivo das leituras:

- Confirmar o padrao real de controller e modulo usado no backend.
- Confirmar o padrao real de testes de integracao HTTP em formato Rest Client.
- Descobrir se o projeto ja possui tratamento centralizado de erros.
- Descobrir se o projeto ja possui autenticacao compartilhada, guard JWT ou decorator de usuario autenticado.
- Identificar como o caso de uso recebe `In`, produz `Out` e quais dependencias concretas do backend ele exige.
- Descobrir como o projeto reaproveita respostas entre requests HTTP, variaveis temporarias e autenticacao nos arquivos `*.integration.http`.
- Confirmar se os exports do agregado e do modulo permitem importar o caso de uso e seus tipos sem deep imports desnecessarios.

Se algum arquivo obrigatorio nao existir:

- parar para reavaliar a estrutura real do projeto
- localizar o equivalente antes de editar
- registrar a suposicao feita no resultado final
