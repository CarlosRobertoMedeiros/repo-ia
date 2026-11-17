import { sign } from 'jsonwebtoken';

// Expiracao padrao do token: 7 dias (mesma validade do cookie de sessao no front-end).
const TOKEN_EXPIRES_IN = '7d';

export interface TokenUser {
  id: string;
  name: string;
  email: string;
}

// Helper exclusivo da camada HTTP: o modulo de negocio nao conhece token.
export function signUserToken(user: TokenUser, secret: string): string {
  return sign({ sub: user.id, name: user.name, email: user.email }, secret, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}
