import { Injectable } from '@nestjs/common';
import { CryptoProvider } from '@sdd/auth';
import { compare, hash } from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class BcryptCryptoProvider implements CryptoProvider {
  async encrypt(password: string): Promise<string> {
    return hash(password, BCRYPT_SALT_ROUNDS);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
