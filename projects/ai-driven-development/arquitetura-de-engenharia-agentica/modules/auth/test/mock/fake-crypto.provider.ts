import { createHash } from "node:crypto";
import { CryptoProvider } from "../../src";

export const FAKE_HASH_PREFIX = "$2b$10$";

// Hash deterministico no formato bcrypt ($2b$10$ + 53 caracteres), derivado da
// senha: permite que `compare` seja fiel sem depender da biblioteca bcrypt.
function fakeHash(password: string): string {
  const digest = createHash("sha256").update(password).digest("hex").slice(0, 53);

  return `${FAKE_HASH_PREFIX}${digest}`;
}

export class FakeCryptoProvider implements CryptoProvider {
  readonly encryptedPasswords: string[] = [];
  readonly comparedPasswords: string[] = [];

  async encrypt(password: string): Promise<string> {
    this.encryptedPasswords.push(password);
    return fakeHash(password);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    this.comparedPasswords.push(password);
    return hashedPassword === fakeHash(password);
  }
}
