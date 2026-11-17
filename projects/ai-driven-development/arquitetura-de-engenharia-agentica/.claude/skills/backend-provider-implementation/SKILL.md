---
name: backend-provider-implementation
description: Implementa no backend NestJS os providers técnicos definidos nos módulos de negócio, criando classes concretas simples, integrando dependências externas quando necessário e registrando essas implementações para uso pelos controllers e casos de uso.
---

# Backend Provider Implementation

Use esta skill quando o pedido for implementar, no backend NestJS, uma interface de provider definida em `modules/<modulo>/src/**/provider/*.provider.ts`.

O foco desta skill e criar uma classe concreta simples, direta e facil de manter no backend, registrar essa classe no modulo Nest correspondente e permitir injecao direta da propria classe concreta no backend, sem inventar tokens, symbols, wrappers ou camadas extras desnecessarias.

## Objetivo

- criar a implementacao concreta de um provider tecnico definido no dominio
- manter a interface original do dominio intacta
- integrar a classe concreta ao modulo Nest correspondente
- permitir uso por injecao direta da classe concreta no backend
- instalar dependencias externas quando a implementacao realmente precisar
- evitar arquitetura excessiva para resolver um provider tecnico simples

## Entradas obrigatorias

Esta skill so pode prosseguir quando o provider alvo estiver claramente identificado por um dos modos abaixo:

1. path explicito do arquivo da interface, como `modules/auth/src/user/provider/crypto.provider.ts`
2. nome inequivoco da interface, como `CryptoProvider`, apenas quando houver um unico alvo claro no projeto

Informacoes adicionais obrigatorias apenas quando nao puderem ser inferidas com seguranca:

3. nome do modulo, quando o path nao bastar para inferir `modules/<modulo>`
4. tipo do provider ou intencao da implementacao, quando isso for necessario para escolher biblioteca, estrategia ou naming

## Entradas opcionais

- biblioteca preferida para a implementacao
- restricoes como:
  - evitar dependencias extras
  - reutilizar biblioteca ja instalada
  - usar abordagem sincrona ou assincrona
  - compatibilidade com API externa especifica

## Trava obrigatoria

- Esta skill so pode executar quando a interface de provider alvo estiver claramente identificada.
- Se houver ambiguidade sobre qual interface implementar, parar e pedir ao usuario o provider exato.
- Nao modificar, reescrever ou expandir a interface original do dominio.
- Tratar qualquer interface em `modules/<modulo>/src/**` como contrato imutavel.
- Se o contrato nao der informacao suficiente para escolher uma estrategia segura, pedir esclarecimento em vez de inventar comportamento arriscado.

## Leituras obrigatorias

Antes de editar qualquer arquivo, leia obrigatoriamente:

1. a interface alvo dentro de `modules/<modulo>/src/**/provider/*.provider.ts`
2. os tipos relacionados exigidos por essa interface
3. `modules/auth/src/user/provider/crypto.provider.ts`
4. `apps/backend/src/modules/auth/bcrypt.crypto.ts`
5. `apps/backend/src/modules/auth/auth.module.ts`
6. `apps/backend/src/modules/<modulo>/<modulo>.module.ts`
7. o controller ou ponto de uso no backend, quando isso ajudar a entender como a implementacao sera consumida

Depois disso, leia tambem os materiais internos desta skill:

- `references/mandatory-readings.md`
- `references/provider-implementation-checklist.md`
- `references/few-shots/bcrypt-crypto.provider.example.ts`
- `references/few-shots/auth-module.provider-registration.example.ts`
- `references/few-shots/uuid.provider.example.ts`

Se alguma leitura obrigatoria falhar, pare e relate o bloqueio com clareza.

## Escopo

- ler a interface alvo e os tipos relacionados
- inferir o modulo pelo path real em `modules/<modulo>/...`
- criar a implementacao concreta em `apps/backend/src/modules/<modulo>/`
- atualizar `apps/backend/src/modules/<modulo>/<modulo>.module.ts`
- instalar dependencias externas quando necessario
- ajustar consumidores do backend apenas no minimo necessario para permitir injecao direta da classe concreta

## Fora de escopo

- modificar o contrato do provider no dominio
- criar tokens simbolicos por padrao
- criar adapters, wrappers, factories ou camadas extras sem ganho pratico
- refatorar o dominio so para acomodar a implementacao do backend
- espalhar abstracoes novas quando a classe concreta basta

## Convencoes obrigatorias

- Criar a implementacao por padrao na raiz de `apps/backend/src/modules/<modulo>/`.
- So criar subpastas se houver uma convencao local forte ou pedido explicito do usuario.
- O nome do arquivo deve refletir a responsabilidade tecnica do provider.
- O nome da classe deve ser explicito e orientado a implementacao concreta.
  - Exemplo: `BcryptCryptoProvider`
- A implementacao deve cumprir exatamente o contrato da interface original.
- Nao adicionar metodos publicos extras fora do contrato, salvo helpers privados estritamente necessarios.
- Preferir `@Injectable()` e injecao direta da classe concreta nos controllers ou servicos Nest.
- O backend pode receber a classe concreta e repassa-la aos casos de uso que dependem da interface do dominio.

## Workflow deterministico

1. Validar a entrada.
   - Confirmar que existe exatamente uma interface alvo.
   - Confirmar que o arquivo pertence a `modules/<modulo>/src/`.
   - Se houver ambiguidade, interromper.
2. Ler o contrato e o contexto minimo.
   - Abrir a interface alvo.
   - Ler tipos, DTOs, enums e retornos usados pelo contrato.
   - Ler o modulo backend correspondente.
   - Ler o ponto de uso no backend quando isso ajudar a entender como a classe sera injetada.
3. Ler o exemplo real do projeto.
   - Usar `CryptoProvider` + `BcryptCryptoProvider` + `AuthModule` como referencia base.
4. Inferir destino e naming.
   - Inferir `<modulo>` pelo path real.
   - Criar o arquivo na raiz de `apps/backend/src/modules/<modulo>/` por padrao.
   - Escolher nome de classe concreto e previsivel.
5. Escolher a estrategia de implementacao.
   - Reutilizar bibliotecas ja instaladas quando cobrirem o contrato.
   - Se mais de uma biblioteca for razoavel e o usuario nao tiver preferencia, escolher a opcao mais simples e estavel.
   - Se a escolha ainda for arriscada, parar e pedir confirmacao.
6. Implementar a classe concreta.
   - Criar uma classe Nest simples.
   - Implementar exatamente os metodos da interface.
   - Manter a logica tecnica concentrada no proprio arquivo.
   - Usar helpers privados apenas quando isso melhorar clareza ou reduzir repeticao real.
7. Integrar ao Nest.
   - Atualizar `apps/backend/src/modules/<modulo>/<modulo>.module.ts`.
   - Registrar a classe em `providers`.
   - Exportar a classe quando fizer sentido para outros modulos.
8. Ajustar consumidores do backend.
   - Preferir construtores como `constructor(private readonly cryptoProvider: BcryptCryptoProvider)`.
   - Permitir que controllers e servicos Nest passem a classe concreta para casos de uso que dependem da interface.
   - Nao alterar o contrato do dominio.
9. Instalar dependencias externas quando necessario.
   - Preferir instalar no workspace `@<scope>/backend`.
   - Exemplos:
     - `npm install --workspace @<scope>/backend nodemailer`
     - `npm install --workspace @<scope>/backend jsonwebtoken`
   - Adicionar `@types/*` quando a biblioteca exigir tipos separados.
10. Testar e verificar.
   - Criar testes quando houver logica observavel relevante.
   - Seguir o padrao de testes do backend se ele existir.
   - Quando nao houver padrao claro, criar um `*.spec.ts` simples ao lado da implementacao.
   - Rodar ao menos o build do backend e os testes relevantes do backend quando possivel.
11. Reportar resultado.
   - Informar interface implementada, modulo inferido, arquivos criados ou alterados e dependencias adicionadas.

## Regras de implementacao

- Priorizar implementacao simples, direta e facil de manter.
- A classe concreta deve ficar no backend.
- O backend deve poder injetar a classe concreta diretamente.
- Nao exigir symbol, token ou abstracao extra para a implementacao funcionar no backend.
- Nao adicionar comportamento fora do contrato, exceto detalhes tecnicos inevitaveis da biblioteca usada.
- Nao mover regra de negocio para dentro do provider tecnico.
- Se houver configuracao tecnica pequena e estavel, mantela no proprio arquivo com constantes locais claras.
- Se o provider precisar de configuracao sensivel ou variavel, seguir o padrao ja existente do backend para `ConfigService` ou `.env`, sem reinventar infraestrutura.

## Regras para dependencias externas

- Identificar se a implementacao exige biblioteca externa.
- Reaproveitar primeiro o que ja estiver instalado no projeto.
- Quando precisar instalar algo novo, preferir bibliotecas maduras, simples e compativeis com o projeto.
- Se houver varias opcoes razoaveis e nenhuma preferencia do usuario, escolher a opcao mais simples e estavel.
- Relatar claramente quais dependencias foram adicionadas e por que.
- Evitar dependencias extras quando o runtime do Node ou uma biblioteca ja presente resolverem o contrato.

## Regras de integracao com Nest

- Registrar a implementacao concreta em `apps/backend/src/modules/<modulo>/<modulo>.module.ts`.
- Incluir a classe em `providers`.
- Incluir em `exports` quando outros modulos puderem precisar dela.
- Ajustar o consumo no backend para usar a classe concreta diretamente.
- O padrao preferido e:
  - classe concreta registrada no modulo
  - classe concreta injetada diretamente em controllers ou servicos Nest
  - classe concreta repassada aos casos de uso que dependem da interface do dominio

## Regras de adaptacao ao contexto

Esta skill deve se adaptar a providers tecnicos como:

- criptografia
- JWT
- e-mail
- geracao de token
- relogio e data
- uuid
- storage
- integracoes externas simples

Quando a interface nao trouxer contexto suficiente para definir o comportamento com seguranca, parar e pedir esclarecimento.

## Regras de testes

- Quando a implementacao tiver logica observavel relevante, criar testes.
- Quando a implementacao depender muito de biblioteca externa, criar ao menos testes uteis para o comportamento esperado e relatar limites de cobertura.
- Seguir o padrao de testes do backend ou do modulo, quando ele existir.
- Preferir testes pequenos e diretos, focados no contrato implementado.

## Guardrails

- Nao executar sem alvo inequivoco.
- Nao editar o provider do dominio.
- Nao expandir interfaces do dominio.
- Nao criar tokens ou symbols desnecessarios.
- Nao instalar bibliotecas sem necessidade real.
- Nao ajustar consumidores alem do necessario para a injecao funcionar no backend.
- Nao inventar comportamento quando o contrato estiver incompleto.

## Saida esperada

- implementacao concreta criada em `apps/backend/src/modules/<modulo>/`
- `apps/backend/src/modules/<modulo>/<modulo>.module.ts` atualizado
- consumidores do backend ajustados apenas no necessario para injecao direta
- dependencias externas instaladas apenas quando realmente precisarem
- testes adicionados quando houver comportamento observavel relevante

