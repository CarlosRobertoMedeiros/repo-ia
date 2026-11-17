import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DeleteUser, SaveUser, type SaveUserIn, type User } from '@sdd/auth';
import { NotFoundError } from '@sdd/shared';
import { BcryptCryptoProvider } from './crypto.provider';
import { PrismaUserRepository } from './user.prisma';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;

type UserResponse = {
  id: string;
  name: string;
  email: string;
};

// Entidades usam `props` protegido e getters de prototype: nao serializam via
// JSON.stringify. O retorno e montado explicitamente (e nunca expoe a senha).
function toUserResponse(user: User): UserResponse {
  return { id: user.id, name: user.name, email: user.email };
}

function toPositiveInt(
  value: string | undefined,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = Number.parseInt(value ?? '', 10);

  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

@Controller('users')
export class UserController {
  constructor(
    private readonly cryptoProvider: BcryptCryptoProvider,
    private readonly userRepository: PrismaUserRepository,
  ) {}

  @Post()
  async create(@Body() body: SaveUserIn): Promise<{ id: string }> {
    const id = body.id ?? randomUUID();
    const useCase = new SaveUser(this.cryptoProvider, this.userRepository);

    await useCase.execute({ ...body, id });

    return { id };
  }

  @Put(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() body: SaveUserIn,
  ): Promise<void> {
    const useCase = new SaveUser(this.cryptoProvider, this.userRepository);

    await useCase.execute({ ...body, id });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    const useCase = new DeleteUser(this.userRepository);

    await useCase.execute({ id });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('user.not_found');
    }

    return toUserResponse(user);
  }

  @Get()
  async findPage(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const result = await this.userRepository.findPage({
      page: toPositiveInt(page, DEFAULT_PAGE),
      perPage: toPositiveInt(perPage, DEFAULT_PER_PAGE, MAX_PER_PAGE),
    });

    return { ...result, items: result.items.map(toUserResponse) };
  }
}
