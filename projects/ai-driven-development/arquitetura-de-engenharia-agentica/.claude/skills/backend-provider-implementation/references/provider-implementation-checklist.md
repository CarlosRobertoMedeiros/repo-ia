# Provider Implementation Checklist

## Nome e destino

- inferir `<modulo>` pelo path real em `modules/<modulo>/...`
- criar o arquivo na raiz de `apps/backend/src/modules/<modulo>/` por padrao
- escolher nome de arquivo coerente com a responsabilidade tecnica
- escolher nome de classe concreto e explicito

Exemplos de naming:

- `bcrypt.crypto.ts` -> `BcryptCryptoProvider`
- `jwt.token.ts` -> `JwtTokenProvider`
- `system.clock.ts` -> `SystemClockProvider`
- `node.uuid.ts` -> `NodeUuidProvider`

## Estrategia de biblioteca

Ordem de preferencia:

1. biblioteca ja instalada que encaixa bem no contrato
2. runtime do Node quando ele resolver o contrato com seguranca
3. biblioteca madura, simples e estavel

Sugestoes por intencao:

- senha e hash: `bcrypt` quando o contrato for de criptografia de senha
- JWT: `jsonwebtoken` quando bastar assinar e validar tokens simples
- e-mail: `nodemailer` para envio SMTP simples
- uuid: `randomUUID` de `node:crypto` antes de adicionar dependencia
- clock: `new Date()` ou `Date.now()` encapsulados em provider simples

## Integracao Nest

- adicionar `@Injectable()` na classe concreta
- registrar a classe em `providers`
- exportar a classe quando outros modulos puderem precisar dela
- preferir injecao direta da classe concreta em controllers e servicos Nest
- passar a classe concreta para casos de uso que dependem da interface do dominio

## Testes

Criar testes quando houver pelo menos um destes sinais:

- logica observavel alem de mero passthrough
- configuracao propria da implementacao
- normalizacao, fallback ou transformacao de dados
- risco real de regressao no contrato

Se a biblioteca externa fizer o trabalho quase inteiro, teste o contrato exposto pela classe e documente os limites de cobertura.

## O que evitar

- editar a interface do dominio
- criar tokens, symbols ou wrappers sem necessidade
- adicionar metodos publicos fora do contrato
- empurrar regra de negocio para infraestrutura
- instalar dependencia nova quando a atual ja resolve
- espalhar a implementacao por varios arquivos sem necessidade
