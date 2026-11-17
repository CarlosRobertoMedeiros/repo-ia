export type JwtUserPayload = {
  sub: string;
  name: string;
  email: string;
};

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * Le o payload de um JWT no client, so para exibir dados do usuario e
 * reidratar a sessao. NAO valida a assinatura (o segredo vive no backend):
 * a protecao real das rotas e sempre feita pela API.
 *
 * Os bytes sao decodificados como UTF-8 (e nao com `atob` direto) para
 * preservar acentuacao, ex.: "Jose" com acento continua igual.
 *
 * Retorna `null` para token malformado, sem os campos esperados ou expirado.
 */
export function decodeJwtPayload(token: string): JwtUserPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;

    const json = new TextDecoder('utf-8').decode(base64UrlToBytes(parts[1]));
    const payload: unknown = JSON.parse(json);

    if (typeof payload !== 'object' || payload === null) return null;

    const { sub, name, email, exp } = payload as Record<string, unknown>;

    if (typeof sub !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
      return null;
    }

    if (typeof exp === 'number' && exp * 1000 <= Date.now()) return null;

    return { sub, name, email };
  } catch {
    return null;
  }
}
