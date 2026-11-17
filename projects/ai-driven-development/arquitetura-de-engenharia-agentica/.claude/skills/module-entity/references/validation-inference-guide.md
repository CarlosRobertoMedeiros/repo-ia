# Validation Inference Guide

Use este guia junto com as regras reais em `packages/shared/src/validation/rules/`.

## Processo de escolha

1. Identifique a semantica do campo pelo nome.
2. Cruze com o tipo TypeScript.
3. Procure primeiro uma regra compartilhada existente.
4. Combine regras simples em vez de criar regra nova cedo demais.
5. So crie uma nova regra compartilhada quando a necessidade for generica e recorrente.

## Mapeamentos comuns

- `name`, `fullName`, `ownerName`
  - `RequiredRule`
  - `MinLengthRule`
  - `MaxLengthRule`
  - `PersonNameRule`
- `email`
  - `RequiredRule`
  - `EmailRule`
- `passwordHash`, `hashedPassword`
  - `BcryptHashRule`
- `password`
  - `RequiredRule`
  - `StrongPasswordRule`
  - `NoCommonPasswordRule`
- `slug`
  - `RequiredRule`
  - `SlugRule`
- `url`, `website`
  - `RequiredRule`
  - `UrlRule`
- `domain`
  - `RequiredRule`
  - `DomainRule`
- `phone`
  - `RequiredRule`
  - `PhoneRule`
  - `PhoneBrRule` quando a semantica for brasileira
- `cpf`, `cnpj`, `cep`, `rg`
  - usar a regra especifica existente
- `id`, `userId`, `customerId`, `transactionId`
  - `RequiredRule`
  - `UuidRule`
- `quantity`, `count`, `installments`
  - `RequiredRule`
  - `IntegerRule`
  - `PositiveRule`
- `amount`, `price`, `total`
  - `RequiredRule`
  - `PositiveRule`
  - `PrecisionRule` quando houver escala monetaria definida
- `createdOn`, `expiresAt`, `birthDate`
  - `RequiredRule`
  - `DateRule`
  - `PastDateRule` ou `FutureDateRule` conforme o caso
- arrays como `tags`, `items`, `emails`
  - `RequiredRule` se nao puder faltar
  - `MinItemsRule`
  - `MaxItemsRule`
  - `UniqueItemsRule`

## Sinais de que vale criar regra compartilhada nova

- a validacao nao depende da entidade atual
- o nome da regra faz sentido em qualquer modulo
- a regra pode ser testada isoladamente no `shared`
- a regra representa formato, faixa, combinacao ou politica generica

## Sinais de que nao vale criar regra compartilhada nova

- a regra menciona contexto exclusivo de um agregado
- o erro faria sentido apenas para uma entidade
- a necessidade pode ser atendida combinando regras existentes
