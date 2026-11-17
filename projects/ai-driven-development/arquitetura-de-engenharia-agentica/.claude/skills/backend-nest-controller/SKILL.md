---
name: backend-nest-controller
description: Cria controllers padronizados no backend NestJS para expor casos de uso dos módulos de negócio, reaproveitando contratos existentes, integrando autenticação quando necessário, respeitando o tratamento centralizado de erros da aplicação e gerando testes de integração HTTP em formato Rest Client.
---

# Backend Nest Controller

## Objetivo

Criar ou atualizar controllers do backend NestJS em `apps/backend/src/modules/<modulo>/` para expor casos de uso definidos em `modules/<modulo>/src/**/usecase/*.usecase.ts`.

Esta skill deve manter o controller fino, simples e focado apenas na adaptacao entre HTTP e caso de uso. Sempre que possivel, ela deve reutilizar diretamente a interface `In` e a saida do caso de uso, evitar DTOs redundantes, integrar autenticacao apenas quando fizer sentido e confiar na infraestrutura compartilhada de erros e auth que o projeto ja possuir.

Sempre que criar ou atualizar um controller, a skill tambem deve criar ou atualizar o arquivo de teste de integracao HTTP do modulo no formato entendido pelo plugin Rest Client do Visual Studio Code. O arquivo deve ficar ao lado do controller, usar o mesmo nome-base do modulo e terminar com `.integration.http`.

## Entradas obrigatorias

1. Nome do modulo, ou path inequivoco dentro de `modules/`.
2. Nome do agregado, ou path inequivoco do agregado.
3. Nome do caso de uso a ser exposto.
4. Metodo HTTP desejado:
   - `get`
   - `post`
   - `put`
   - `patch`
   - `delete`
5. Path da rota, quando o usuario quiser defini-lo explicitamente.

## Entradas opcionais

6. Se a rota deve ser autenticada ou publica.
7. Se a entrada HTTP pode reutilizar diretamente a interface `In` do caso de uso.
8. Se o caso de uso depende do usuario autenticado.
9. Regras especificas de binding, como uso de `@Body`, `@Param`, `@Query` ou combinacoes entre eles.

## Trava obrigatoria

- Esta skill nao pode prosseguir se o caso de uso alvo nao estiver claramente identificado.
- Se houver ambiguidade entre mais de um modulo, agregado ou arquivo `*.usecase.ts`, parar e pedir a identificacao correta ao usuario.
- Antes de editar qualquer arquivo, localizar o caso de uso real e ler sua entrada, sua saida e suas dependencias.
- Esta skill cria controller do NestJS. Ela nao cria o caso de uso, nao altera o contrato do dominio sem pedido explicito e nao inventa infraestrutura fora do escopo.

## Leituras obrigatorias

Antes de implementar, ler obrigatoriamente os arquivos listados em `references/mandatory-readings.md`.

Isso inclui, no minimo:

- `apps/backend/src/modules/auth/auth.controller.ts`
- `apps/backend/src/modules/auth/auth.module.ts`
- `apps/backend/src/modules/auth/auth.integration.http`
- o caso de uso alvo em `modules/<modulo>/src/**/usecase/*.usecase.ts`
- o `index.ts` do agregado correspondente
- o `index.ts` do modulo correspondente
- `apps/backend/src/app.module.ts`

Tambem e obrigatorio localizar e ler a infraestrutura real do backend ligada a:

- autenticacao
- guards
- decorators
- filtros globais
- tratamento de erro
- `request.user`, `req.user`, `CurrentUser`, `Jwt`, `AuthGuard`, `Bearer`

Se `apps/backend/src/shared/` nao existir, procurar os equivalentes reais antes de assumir outra arquitetura.

## Workflow

1. Validar a entrada obrigatoria.
   - Confirmar modulo, agregado e caso de uso de forma inequivoca.
   - Resolver o arquivo do caso de uso alvo em `modules/<modulo>/src/**/usecase/*.usecase.ts`.
   - Se o caso de uso nao puder ser identificado com seguranca, interromper.
2. Ler o contexto obrigatorio.
   - Abrir `auth.controller.ts`, `auth.module.ts`, o caso de uso alvo, os `index.ts` do agregado e do modulo e `app.module.ts`.
   - Procurar infraestrutura compartilhada de autenticacao e erro em `apps/backend/src/**`.
   - Se existir bootstrap relevante em `apps/backend/src/main.ts`, ler tambem para entender filtros e pipes globais.
3. Inspecionar o caso de uso real.
   - Identificar `In`, `Out`, nome da classe e assinatura de `execute`.
   - Identificar dependencias do construtor.
   - Confirmar se o caso de uso precisa de contexto autenticado ou se o usuario pediu rota autenticada.
4. Definir o contrato HTTP.
   - Mapear o metodo HTTP e o path do endpoint.
   - Preferir usar a interface `In` do caso de uso diretamente quando o payload HTTP for compativel.
   - So criar DTO especifico do controller quando houver adaptacao real entre HTTP e o contrato do caso de uso.
   - Escolher o binding mais simples entre `@Body`, `@Param`, `@Query` ou composicao minima entre eles.
5. Criar ou atualizar o controller do modulo.
   - Editar `apps/backend/src/modules/<modulo>/<modulo>.controller.ts`.
   - Preservar endpoints existentes e adicionar o novo endpoint sem sobrescrever os demais.
   - Seguir o padrao real do projeto para instanciacao do caso de uso:
     - se o projeto instancia o caso de uso dentro do endpoint com providers concretos injetados no controller, manter esse padrao
     - se o projeto ja encapsula o caso de uso em provider Nest, reutilizar o padrao existente
6. Criar ou atualizar o teste de integracao HTTP do modulo.
   - Editar `apps/backend/src/modules/<modulo>/<modulo>.integration.http`.
   - Preservar cenarios existentes e adicionar o novo endpoint sem sobrescrever os demais.
   - Seguir o formato do plugin Rest Client do Visual Studio Code, com variaveis declaradas no topo, requests separados por `###` e comentarios curtos com o comportamento esperado.
   - Quando um request precisar reaproveitar dados de outro, usar `# @name` e variaveis derivadas da resposta em vez de copiar valores manualmente.
7. Integrar autenticacao quando necessario.
   - Reutilizar guard, decorator e contexto autenticado ja existentes.
   - Se o caso de uso depender do usuario autenticado, obter esse dado da infraestrutura compartilhada do backend, nunca por parsing manual do header.
8. Atualizar o modulo Nest.
   - Garantir que `apps/backend/src/modules/<modulo>/<modulo>.module.ts` registra o controller.
   - Verificar se providers concretos usados pelo controller ja estao registrados.
   - Se faltar provider concreto necessario para o caso de uso funcionar, integrar apenas o que existir e reportar claramente a lacuna.
9. Validar o resultado.
   - Revisar imports, decorators, rota e status HTTP.
   - Revisar o `.integration.http` para confirmar que os cenarios conseguem ser executados em sequencia, com dados reutilizaveis e sem valores sensiveis hardcoded.
   - Quando fizer sentido, rodar build ou testes do backend.
   - Reportar arquivos alterados e qualquer dependencia que deva ser resolvida por outra skill.

## Regras de implementacao do controller

- O controller deve ser fino e simples.
- O controller deve apenas:
  - receber a requisicao HTTP
  - montar ou repassar a entrada do caso de uso
  - instanciar ou injetar dependencias no padrao ja usado pelo projeto
  - executar o caso de uso
  - devolver a resposta HTTP apropriada
- Priorizar um fluxo em que a entrada do controller seja a mesma interface `In` do caso de uso.
- Evitar logica de negocio, validacao de dominio e transformacoes desnecessarias no controller.
- Preferir importar o caso de uso e seus tipos pelos exports existentes do modulo ou do agregado quando eles ja estiverem publicados pelos `index.ts`.
- Nao alterar os `index.ts` do dominio apenas para acomodar o controller, salvo pedido explicito do usuario.

## Regras para contratos e DTOs

- Reutilizar a interface de entrada do caso de uso sempre que o payload HTTP puder mapear diretamente para ela.
- Nao criar DTO, interface ou type redundante so para repetir o mesmo shape de `In`.
- Criar DTO especifico do controller apenas quando houver necessidade real, por exemplo:
  - combinar `@Param()` com `@Body()`
  - combinar `@Query()` com usuario autenticado
  - adaptar nomes de campos vindos da rota
  - separar concerns HTTP do contrato de dominio
- Quando o caso de uso retornar dados, devolver a saida de forma direta, salvo ajuste simples de shape ou status exigido pelo contexto HTTP.
- Quando nao houver retorno relevante, devolver resposta enxuta e coerente com o metodo HTTP usado.

## Regras para tratamento de erros

- Se o backend ja tiver filtro global, interceptor, helper compartilhado ou qualquer infraestrutura centralizada de erro, confiar nessa estrutura.
- Nao duplicar `try/catch` desnecessario dentro dos endpoints.
- Se nao houver estrutura centralizada ainda, seguir o padrao atual do projeto com a menor repeticao possivel.
- Evitar espalhar tratamento manual de erro novo por varios endpoints.
- Se a ausencia dessa infraestrutura comprometer a qualidade do controller, apontar que a skill `$backend-nest-config` pode consolidar a base compartilhada.

## Regras para autenticacao

- Verificar se a rota deve ser autenticada com base no pedido do usuario, no contexto do caso de uso e na infraestrutura existente.
- Se a rota for autenticada, integrar o endpoint com o guard e os decorators ja existentes no backend.
- Se o projeto ja tiver guard JWT e decorator de usuario autenticado, reutiliza-los.
- Se o caso de uso precisar do usuario autenticado, obter o dado do request pela estrutura compartilhada do backend.
- Se a infraestrutura de autenticacao ainda nao existir, nao inventar arquitetura paralela. Deixar a integracao preparada da forma mais coerente com o projeto e relatar a lacuna.

## Regras para testes de integracao HTTP

- Sempre criar ou atualizar `apps/backend/src/modules/<modulo>/<modulo>.integration.http` junto com o controller.
- O nome do arquivo deve ser exatamente o mesmo nome-base do controller do modulo, trocando apenas `.controller.ts` por `.integration.http`.
- O arquivo deve seguir o formato do Rest Client:
  - variaveis no topo com `@nome = valor`
  - cenarios separados por `###`
  - comentarios curtos descrevendo o objetivo e o status esperado
  - `Content-Type: application/json` quando houver body JSON
- Declarar uma variavel reutilizavel para diferenciar dados de teste entre execucoes, como `@scenarioVersion = {{$timestamp}}`, e usa-la em email, nome, slug, codigo ou qualquer identificador que precise ser unico.
- Quando o endpoint criar varias entidades semelhantes, usar a variavel de versao para gerar pequenas variacoes previsiveis e evitar colisao entre requests.
- Quando um request produzir um valor usado por outro teste, nomear o request com `# @name` e capturar o valor via variaveis derivadas da resposta.
- Para autenticacao:
  - se a API for fechada, incluir no inicio do fluxo um cenario de criacao de usuario quando necessario e um cenario de login
  - armazenar o token retornado em uma variavel temporaria
  - reutilizar esse token nos endpoints protegidos com `Authorization: Bearer {{nomeDaVariavel}}`
  - nunca deixar token JWT fixo hardcoded no arquivo
- Para endpoints protegidos, cobrir pelo menos:
  - acesso sem token, quando fizer sentido
  - acesso com token invalido, quando fizer sentido
  - acesso com token valido
- Para endpoints publicos de escrita, incluir ao menos um cenario valido e um ou mais cenarios invalidos relevantes para a regra de negocio ou validacao exposta.
- Sempre que possivel, manter os cenarios executaveis de cima para baixo, para que a criacao de dados e a autenticacao alimentem os requests posteriores.
- Nao inventar asserts fora do formato suportado pelo Rest Client. Priorizar requests claros, nomes descritivos e comentarios objetivos sobre o resultado esperado.

## Regras de binding HTTP

- Usar `@Body()` para payload de escrita.
- Usar `@Param()` para identificadores e segmentos de rota.
- Usar `@Query()` para filtros, paginacao e buscas.
- Quando for possivel montar a entrada do caso de uso sem estruturas extras, fazer isso diretamente.
- Quando for necessario combinar bindings, manter a montagem do objeto `In` local, explicita e enxuta.
- Usar `@HttpCode()` apenas quando o contexto realmente exigir um status diferente do padrao do Nest para aquele metodo.

## Regras de integracao com o modulo Nest

- Garantir que o controller esteja registrado no modulo Nest correspondente.
- Verificar se os providers concretos usados pelo controller ja existem em `providers`, `imports` ou `exports` do modulo.
- Se faltarem implementacoes concretas necessarias para o caso de uso funcionar, nao inventar persistencia, auth ou providers fora do escopo.
- Nesses casos, integrar o que ja existir e reportar claramente o que depende de outra skill, como `$backend-prisma-repository` ou `$backend-nest-config`.

## Determinismo

- Controller alvo: `apps/backend/src/modules/<modulo>/<modulo>.controller.ts`
- Teste de integracao alvo: `apps/backend/src/modules/<modulo>/<modulo>.integration.http`
- Modulo alvo: `apps/backend/src/modules/<modulo>/<modulo>.module.ts`
- Nomes, paths e organizacao devem seguir o modulo real descoberto em `modules/<modulo>`.
- Preservar o que ja existe e adicionar apenas o necessario para expor o novo caso de uso e seus cenarios de integracao HTTP.
- Nao mover arquivos, nao recriar controllers inteiros e nao sobrescrever endpoints existentes.

## Few-shots

Consulte os exemplos locais apenas depois das leituras obrigatorias:

- `references/few-shots/public-endpoint.example.ts`
- `references/few-shots/authenticated-endpoint.example.ts`
- `apps/backend/src/modules/auth/auth.integration.http`

O primeiro mostra um endpoint publico reaproveitando `In` diretamente.
O segundo mostra um endpoint autenticado em que o usuario logado entra no objeto de entrada do caso de uso sem parsing manual de header.
O terceiro mostra o formato esperado para testes de integracao HTTP com Rest Client, incluindo reuso de variaveis e fluxo autenticado.

## Saida esperada

- Controller do modulo backend criado ou atualizado em `apps/backend/src/modules/<modulo>/<modulo>.controller.ts`
- Teste de integracao HTTP criado ou atualizado em `apps/backend/src/modules/<modulo>/<modulo>.integration.http`
- Modulo Nest correspondente atualizado em `apps/backend/src/modules/<modulo>/<modulo>.module.ts` quando necessario
- Endpoint novo integrado ao caso de uso real, com bindings HTTP simples, autenticacao coerente com o projeto, sem duplicacao desnecessaria de contratos e com cobertura basica via Rest Client para o fluxo publico ou autenticado correspondente
