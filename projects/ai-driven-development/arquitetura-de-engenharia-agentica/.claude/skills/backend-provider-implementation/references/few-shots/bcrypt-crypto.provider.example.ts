import { Injectable } from '@nestjs/common';
import { CryptoProvider } from '@<scope>/auth';
import { compare, hash } from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class BcryptCryptoProvider implements CryptoProvider {
  async encrypt(password: string): Promise<string> {
    return hash(password, BCRYPT_SALT_ROUNDS);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
