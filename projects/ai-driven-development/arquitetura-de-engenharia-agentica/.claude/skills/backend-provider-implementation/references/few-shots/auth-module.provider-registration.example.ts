import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { AuthController } from './auth.controller';
import { BcryptCryptoProvider } from './bcrypt.crypto';
import { PrismaUserRepository } from './user.prisma';

@Module({
  imports: [DbModule],
  controllers: [AuthController],
  providers: [PrismaUserRepository, BcryptCryptoProvider],
  exports: [PrismaUserRepository, BcryptCryptoProvider],
})
export class AuthModule {}
