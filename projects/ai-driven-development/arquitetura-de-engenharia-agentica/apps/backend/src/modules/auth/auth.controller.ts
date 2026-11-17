import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LoginUser,
  RegisterUser,
  type LoginUserIn,
  type RegisterUserIn,
} from '@sdd/auth';
import { Public } from '../../shared/decorators/public.decorator';
import { BcryptCryptoProvider } from './crypto.provider';
import { signUserToken } from './jwt.util';
import { PrismaUserRepository } from './user.prisma';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly cryptoProvider: BcryptCryptoProvider,
    private readonly userRepository: PrismaUserRepository,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() body: RegisterUserIn): Promise<void> {
    const useCase = new RegisterUser(this.cryptoProvider, this.userRepository);

    await useCase.execute(body);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginUserIn) {
    const useCase = new LoginUser(this.cryptoProvider, this.userRepository);
    const user = await useCase.execute(body);

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const token = signUserToken(user, secret);

    return { token, user };
  }
}
