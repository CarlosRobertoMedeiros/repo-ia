# Checklist de Implementacao Prisma por Interface

## Quando ler esta referencia

- Quando a interface de repositorio ja tiver sido informada e a skill precisar transformar o contrato em implementacao concreta.
- Quando houver duvida sobre naming, path espelhado no backend ou registro do provider no Nest.

## Entrada obrigatoria

- Receber uma interface de repositorio explicita.
- Exemplos validos:
  - `UserRepository`
  - `modules/auth/src/user/provider/user.repository.ts`

Sem isso, a skill deve parar.

## Trava de nao alteracao da interface

- A skill pode ler a interface para entender o contrato, mas nao pode modificar esse arquivo.
- A skill tambem nao pode alterar `index.ts` do dominio nem qualquer outro arquivo em `modules/<modulo>/src/**`.
- A injecao no backend deve funcionar por padrao com a propria classe Prisma concreta, sem exigir token simbolico.

## Algoritmo de resolucao

1. Resolver o arquivo exato da interface.
2. Extrair o nome do modulo a partir de `modules/<modulo>/`.
3. Trocar o arquivo final `<nome>.repository.ts` por `<nome>.prisma.ts`.
4. Criar o arquivo resultante diretamente em `apps/backend/src/modules/<modulo>/` por padrao.
5. So usar outro path quando o usuario pedir explicitamente.

## Exemplo concreto

Entrada:

```text
modules/auth/src/user/provider/user.repository.ts
```

Saidas esperadas:

- modulo de negocio: `auth`
- modulo backend: `apps/backend/src/modules/auth/auth.module.ts`
- arquivo de implementacao padrao: `apps/backend/src/modules/auth/user.prisma.ts`
- classe concreta: `PrismaUserRepository`

## Padrao de injecao

Como interfaces nao podem ser injetadas diretamente no Nest sem um token de runtime, o padrao desta skill e simplificar o backend: registrar e injetar a classe Prisma concreta.

Exemplo recomendado:

```ts
constructor(private readonly userRepository: PrismaUserRepository) {}
```

O contrato `UserRepository` continua sendo importante no dominio e no caso de uso, mas o backend nao precisa criar `Symbol(...)` por padrao quando a implementacao concreta ja e conhecida.

## Padrao do arquivo Prisma

Exemplo de esqueleto:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../db/prisma.service';
import { User, UserPageParams, UserRepository } from '@<scope>/auth';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: this.toPersistence(data),
    });

    return this.toDomain(created);
  }

  async update(data: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: data.id },
      data: this.toPersistence(data),
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({
      where: { id },
    });

    return found ? this.toDomain(found) : null;
  }

  async findPage(params: UserPageParams) {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const skip = (page - 1) * perPage;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: items.map((item) => this.toDomain(item)),
      page,
      perPage,
      total,
    };
  }

  private toPersistence(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    };
  }

  private toDomain(raw: any): User {
    return new User({
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      name: raw.name,
      email: raw.email,
      password: raw.password,
    });
  }
}
```

## Registro no modulo Nest

Padrao esperado em `apps/backend/src/modules/<modulo>/<modulo>.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { PrismaUserRepository } from './user.prisma';

@Module({
  imports: [DbModule],
  providers: [PrismaUserRepository],
  exports: [PrismaUserRepository],
})
export class AuthModule {}
```

## Consumo via injecao

Quando uma classe Nest precisar consumir o contrato:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaUserRepository } from './user.prisma';

@Injectable()
export class RegisterUserHandler {
  constructor(private readonly userRepository: PrismaUserRepository) {}
}
```

Quando esse handler ou controller criar um caso de uso de dominio, a propria instancia de `PrismaUserRepository` pode ser passada para o caso de uso, preservando o contrato `UserRepository` sem exigir token simbolico.

## Regras de seguranca

- Se o arquivo da interface nao pertencer a `modules/<modulo>/src/`, parar.
- Se houver mais de um contrato com o mesmo nome em modulos diferentes, parar e pedir desambiguacao.
- Se o model Prisma correspondente nao existir e o pedido nao incluir alteracao de schema, parar e avisar que a persistencia ainda nao esta pronta.
- Nao criar token simbolico por padrao quando a injecao direta da classe concreta resolver o caso no backend.
- Nao criar subpastas no backend sem necessidade; o default e a raiz de `apps/backend/src/modules/<modulo>/`.
- Se o contrato tiver metodos alem do CRUD basico, implementar apenas o que estiver claramente definido; o restante deve ser sinalizado ao usuario.
