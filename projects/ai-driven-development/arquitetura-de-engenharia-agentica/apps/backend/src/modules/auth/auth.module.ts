import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { BcryptCryptoProvider } from './crypto.provider';
import { PrismaUserRepository } from './user.prisma';

@Module({
  imports: [DbModule],
  controllers: [AuthController, UserController],
  providers: [PrismaUserRepository, BcryptCryptoProvider],
  exports: [PrismaUserRepository, BcryptCryptoProvider],
})
export class AuthModule {}
