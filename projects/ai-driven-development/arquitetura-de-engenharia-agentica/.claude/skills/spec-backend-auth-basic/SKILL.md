---
name: spec-backend-auth-basic
description: Orquestra a criacao da base de autenticacao do backend, incluindo modulo de dominio, agregados, entidades, repositorios, casos de uso, persistencia, autenticacao JWT e integracao com o NestJS, reaproveitando as skills especializadas do projeto.
---

# Spec Backend Auth Basic

Esta skill e uma orquestradora. Ela existe para conduzir, de forma deterministica, a criacao ou evolucao da base de autenticacao do backend e do banco de dados sem reimplementar o trabalho detalhado das skills especializadas do catalogo.

O foco desta primeira versao e somente:

- backend
- dominio
- persistencia
- banco de dados
- autenticacao JWT
- infraestrutura compartilhada do NestJS para rotas autenticadas

Nao incluir frontend por padrao.

## Objetivo

Construir a base de autenticacao do backend da aplicacao de forma orientada por especificacao, coordenando uma sequencia previsivel de skills menores para entregar:

- modulo de autenticacao criado ou evoluido
- agregado principal de usuario
- entidade de usuario
- contrato de repositorio de usuario
- casos de uso de registro e login
- persistencia Prisma
- provider de criptografia
- provider de JWT
- controllers de autenticacao
- infraestrutura compartilhada do NestJS para proteger endpoints

## Natureza da skill

- Esta skill delega para skills especializadas.
- Esta skill nao deve duplicar os workflows detalhados das skills filhas.
- Esta skill deve verificar o resultado de cada etapa antes de avancar.
- Esta skill deve parar de forma explicita quando faltar uma skill critica do catalogo local.
- Esta skill deve respeitar a estrutura real do repositorio e evoluir implementacoes existentes antes de recriar do zero.

## Entradas obrigatorias

Antes de executar a orquestracao, confirme que estas entradas estao claras:

1. nome do modulo de autenticacao, quando nao for simplesmente `auth`
2. nome do agregado principal de usuario
3. nome da entidade principal
4. especificacao minima dos atributos do usuario
5. confirmacao de que o fluxo inclui, no minimo:
   - cadastro
   - login

## Entradas opcionais

Se o usuario informar, incorporar tambem:

- nome dos casos de uso
- nome dos endpoints
- estrutura do payload JWT
- campos de login
- regras adicionais de autenticacao
- se deve usar e-mail como login
- se deve usar username, telefone ou outro identificador
- campos obrigatorios de cadastro
- regras especificas de senha
- claims desejadas no JWT
- tempo de expiracao do token
- se deve haver refresh token nesta primeira versao
- nomes especificos de arquivos, classes ou rotas

## Escopo minimo obrigatorio

Esta skill so esta completa quando a cadeia final contem, no minimo:

1. endpoint de registro de usuario
2. endpoint de login
3. persistencia do usuario
4. senha protegida por provider tecnico apropriado
5. geracao de JWT
6. estrutura para proteger endpoints autenticados
7. acesso ao usuario autenticado via decorator compartilhado
8. tratamento centralizado de erro respeitando `packages/shared`

## Limites

- Nao incluir frontend nesta versao.
- Nao tentar resolver refresh token, autorizacao por perfil, recuperacao de senha ou confirmacao por e-mail, salvo pedido explicito.
- O objetivo padrao e autenticacao basica, solida e extensivel.
- Se o usuario pedir extensoes, mante-las incrementais e simples.

## Validacao obrigatoria do catalogo

Antes de qualquer implementacao, verifique a existencia das skills necessarias no catalogo de skills disponivel (busque por `SKILL.md` dentro de cada pasta de skill, independente do diretorio raiz onde as skills estejam armazenadas).

Procure pelos arquivos de cada skill pelo nome da pasta:

- `config-new-module/SKILL.md`
- `config-package-shared/SKILL.md`
- `module-aggregate/SKILL.md`
- `config-module-entity/SKILL.md`
- `module-entity/SKILL.md`
- `module-repository/SKILL.md`
- `module-use-case/SKILL.md`
- `shared-validation-rule/SKILL.md`
- `backend-provider-implementation/SKILL.md`
- `backend-prisma-sync-module/SKILL.md`
- `backend-prisma-repository/SKILL.md`
- `backend-nest-config/SKILL.md`
- `backend-nest-controller/SKILL.md`

### Regra de resolucao de dependencia por papel

Resolva as skills por papel, nesta ordem:

1. scaffold de modulo:
   - `config-new-module`
2. base compartilhada:
   - `config-package-shared`
3. scaffold de agregado:
   - `module-aggregate`
4. entidade:
   - preferir `config-module-entity`
   - se ela nao existir, usar `module-entity`
   - se nenhuma das duas existir, parar
5. repositorio de dominio:
   - `module-repository`
6. casos de uso:
   - `module-use-case`
7. regras compartilhadas:
   - `shared-validation-rule`, quando necessario
8. providers tecnicos do backend:
   - `backend-provider-implementation`
9. sincronizacao Prisma:
   - `backend-prisma-sync-module`
10. implementacao Prisma do repositorio:
   - `backend-prisma-repository`
11. infraestrutura compartilhada do Nest:
   - `backend-nest-config`
12. controllers do Nest:
   - `backend-nest-controller`

### Comportamento em caso de ausencia

- Se faltar uma skill obrigatoria, parar imediatamente.
- Informar exatamente qual skill faltou e para qual papel ela era necessaria.
- Nao improvisar a implementacao detalhada de uma skill critica ausente.
- So aceitar fallback quando esta skill o definir explicitamente, como no caso `config-module-entity` -> `module-entity`.

## Leituras minimas de contexto antes da orquestracao

Antes de chamar as skills filhas, ler o contexto real do repositorio:

- `modules/auth/src/index.ts`
- `modules/auth/src/user/model/user.entity.ts`
- `modules/auth/src/user/provider/index.ts`
- `modules/auth/src/user/provider/user.repository.ts`
- `modules/auth/src/user/provider/crypto.provider.ts`
- `modules/auth/src/user/usecase/register-user.usecase.ts`
- `apps/backend/src/modules/auth/auth.module.ts`
- `apps/backend/src/modules/auth/auth.controller.ts`
- `apps/backend/src/modules/auth/user.prisma.ts`
- `packages/shared/src/error/index.ts`
- `packages/shared/src/validation/index.ts`
- `packages/shared/src/usecase/index.ts`

Tambem procure no backend por:

- `jwt`
- `token`
- `claims`
- `AuthGuard`
- `CurrentUser`
- `request.user`
- `Authorization`

O objetivo desta leitura e descobrir se a autenticacao ja existe parcialmente, para evoluir a estrutura encontrada em vez de recriar tudo.

## Regras de coerencia de nomes

Durante todo o fluxo:

- manter consistencia entre nome do modulo, agregado, entidade, repositorio, casos de uso, providers, payload JWT e controllers
- preferir nomes simples e previsiveis
- reaproveitar o naming ja existente no repositorio quando houver implementacao parcial
- evitar criar uma arquitetura paralela ao padrao atual do projeto

## Regra especial sobre o modulo

Esta skill deve preferir evoluir o modulo existente antes de criar um novo scaffold.

Fluxo:

1. se `modules/<modulo>` e `apps/backend/src/modules/<modulo>` ja existirem, evoluir a estrutura atual
2. se o modulo nao existir:
   - tentar usar `config-new-module`
   - se o catalogo atual so oferecer scaffold que toca frontend, trate isso como efeito colateral tolerado do bootstrap inicial
   - nao expandir, nao evoluir e nao considerar o frontend como parte da entrega desta skill
3. se o scaffold disponivel nao permitir criar o minimo necessario para seguir com seguranca, parar e reportar a limitacao do catalogo

## Sequencia deterministica de orquestracao

Execute as etapas abaixo em ordem. Nao pule validacoes intermediarias.

### 1. Garantir a base do projeto e do modulo

- verificar se o projeto ja contem `packages/shared`, `apps/backend`, `modules/` e `apps/backend/src/modules/`
- se o modulo de autenticacao nao existir, acionar `config-new-module`
- ao fim, validar que existem:
  - `modules/<modulo>/`
  - `apps/backend/src/modules/<modulo>/`
  - `apps/backend/src/modules/<modulo>/<modulo>.module.ts`

### 2. Garantir a base compartilhada quando necessario

- verificar se `packages/shared` ja contem os contratos e erros necessarios
- se a base compartilhada estiver ausente ou claramente incompleta para a autenticacao, acionar `config-package-shared`
- ao fim, validar a existencia de erros de dominio, validacao, base de `UseCase` e regras compartilhadas relevantes

### 3. Criar ou preparar o agregado principal do usuario

- acionar `module-aggregate` para o agregado principal do usuario
- preferir um agregado simples, orientado ao fluxo de autenticacao
- ao fim, validar estrutura minima do agregado:
  - `model/`
  - `provider/`
  - `usecase/`
  - `index.ts`

### 4. Criar a entidade principal do usuario

- acionar a skill de entidade resolvida no catalogo:
  - `config-module-entity`, se existir
  - senao `module-entity`
- passar nome do modulo, agregado, entidade e atributos minimos
- incluir validacoes coerentes com:
  - identificador de login
  - senha ou senha em hash
  - campos obrigatorios de cadastro
- ao fim, validar:
  - arquivo da entidade criado ou atualizado
  - teste da entidade criado ou atualizado
  - regras compartilhadas reutilizadas ou justificadas

### 5. Criar o contrato de repositorio do usuario

- acionar `module-repository`
- garantir operacoes minimas para o fluxo:
  - criar usuario
  - buscar por identificador de login
  - buscar por id, quando necessario para claims e rotas protegidas
- ao fim, validar:
  - contrato exportado no agregado
  - fake repository disponivel para testes dos casos de uso

### 6. Criar os casos de uso principais

- acionar `module-use-case` para o caso de uso de registro
- acionar `module-use-case` para o caso de uso de login
- os nomes podem variar conforme a especificacao, mas o fluxo minimo deve continuar cobrindo:
  - cadastro
  - login
- no caso de registro, garantir orquestracao de validacao do usuario, protecao de senha e persistencia
- no caso de login, garantir validacao de credenciais e geracao de JWT ou token equivalente definido para o backend
- ao fim, validar:
  - contratos `In` e `Out` coerentes
  - testes dos casos de uso presentes
  - coverage exigida pela skill filha atendida

### 7. Criar ou reutilizar regras compartilhadas necessarias

- so acionar `shared-validation-rule` quando faltar uma regra realmente generica e reutilizavel
- preferir regras ja existentes em `packages/shared/src/validation/rules`
- exemplos possiveis:
  - regra de login por e-mail
  - regra de senha forte
  - regra de hash bcrypt, quando a entidade armazenar somente hash
- ao fim, validar:
  - nova regra exportada corretamente
  - testes da regra criados

### 8. Sincronizar o dominio com Prisma e banco de dados

- acionar `backend-prisma-sync-module`
- alinhar entidades do modulo com:
  - `apps/backend/prisma/models/<modulo>.model.prisma`
  - migrations incrementais do modulo
- ao fim, validar:
  - schema Prisma atualizado
  - migration gerada
  - banco aplicavel pelo fluxo padrao do projeto

### 9. Criar a implementacao Prisma do repositorio

- acionar `backend-prisma-repository` para o contrato de repositorio principal do usuario
- garantir implementacoes minimas para:
  - `create`
  - `findById`
  - busca por login
  - operacoes adicionais realmente exigidas pelos casos de uso
- ao fim, validar:
  - classe concreta criada em `apps/backend/src/modules/<modulo>/`
  - modulo Nest registrando a implementacao concreta

### 10. Criar implementacoes concretas de providers tecnicos

- acionar `backend-provider-implementation` para o provider de criptografia
- acionar `backend-provider-implementation` para o provider de JWT
- o provider de JWT deve cobrir, no minimo:
  - geracao de token
  - validacao de token ou suporte claro para a strategy compartilhada do backend
- ao fim, validar:
  - implementacoes concretas registradas no modulo Nest
  - dependencias externas instaladas somente se forem necessarias
  - testes adicionados quando houver comportamento observavel relevante

### 11. Configurar a base compartilhada do NestJS

- acionar `backend-nest-config`
- garantir ao menos:
  - filtro global de erros
  - auth guard JWT
  - decorator de usuario autenticado
  - utilitarios compartilhados para payload ou request autenticado
- ao fim, validar:
  - controllers nao precisam mais de `try/catch` repetido apenas para traduzir erro
  - bootstrap do Nest integra a infraestrutura compartilhada

### 12. Criar os controllers da autenticacao

- acionar `backend-nest-controller` para expor os endpoints principais
- criar ou evoluir o controller de auth para:
  - registro
  - login
- manter os controllers enxutos e focados em HTTP
- ao fim, validar:
  - endpoints criados
  - DTOs e contratos coerentes com os casos de uso
  - rotas publicas e rotas protegidas claramente diferenciadas quando necessario

### 13. Validar a integracao final do backend

- confirmar que o backend esta pronto para proteger endpoints fechados com usuario autenticado
- confirmar que ha um caminho claro para `request.user` ou equivalente via decorator compartilhado
- validar que o login retorna o token esperado
- validar que o registro persiste o usuario corretamente

## Regras de orquestracao

- delegar para a skill especializada em vez de repetir suas instrucoes detalhadas
- sempre passar para a skill filha o resultado concreto da etapa anterior
- verificar arquivos e testes gerados em cada etapa antes de seguir
- preferir estruturas simples e faceis de manter
- manter o fluxo incremental e reversivel
- respeitar o padrao atual do projeto e o contexto real do repositorio

## Regras especificas para autenticacao basica

Na ausencia de instrucao mais forte do usuario, adote defaults simples:

- login por e-mail quando o identificador nao for informado
- senha armazenada apenas em formato protegido por provider tecnico
- JWT com claims minimas e estaveis, como `sub` e identificador principal de login, quando isso for compativel com o projeto
- expiracao simples e configuravel do token
- sem refresh token nesta primeira versao

Se o usuario informar outro identificador principal, adapte todas as etapas para manter coerencia entre entidade, repositorio, caso de uso, persistencia e controller.

## Regras de teste e validacao final

Esta skill deve garantir que as skills filhas cumpram seus proprios contratos de teste.

Ao final, validar no minimo:

1. testes relevantes da entidade
2. testes relevantes do repositorio de dominio e de seus fakes
3. testes relevantes dos casos de uso
4. testes relevantes dos providers tecnicos, quando houver
5. build do backend
6. testes relevantes do backend e do modulo `auth`

Se alguma skill filha exigir coverage de 100% para seu escopo, respeite essa exigencia.

Esta skill nao precisa duplicar os testes das skills filhas, mas precisa verificar que a cadeia final esta consistente.

## Condicoes de parada obrigatoria

Pare e reporte com clareza quando ocorrer qualquer um destes casos:

- falta de skill obrigatoria do catalogo
- ambiguidade real sobre modulo, agregado, entidade ou provider alvo
- conflito serio entre a especificacao do usuario e a estrutura atual do repositorio
- impossibilidade de montar o fluxo minimo de autenticacao sem improvisar arquitetura paralela
- falha em testes obrigatorios ou build final

## Formato do relatorio final

Ao concluir a execucao desta skill, entregar um resumo objetivo com:

1. skills utilizadas
2. arquivos principais criados ou alterados
3. testes executados
4. o que foi validado com sucesso
5. pendencias, limitacoes ou proximos passos

## Saida esperada

1. modulo de autenticacao funcional no backend
2. estrutura de dominio criada ou atualizada
3. persistencia integrada ao Prisma
4. providers tecnicos implementados
5. configuracao Nest compartilhada aplicada
6. controllers principais da autenticacao criados
7. JWT integrado
8. base pronta para proteger endpoints autenticados de outros modulos

