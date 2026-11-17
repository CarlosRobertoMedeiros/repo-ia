import type { ApiErrorResponse } from '@/shared/types/api-error.type';

/** Erro de uma resposta HTTP nao-2xx da API, ja com os codigos de `errors[]`. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly codes: string[],
  ) {
    super(codes.join(', '));
    this.name = 'ApiError';
  }
}

export function extractErrorCodes(body: Partial<ApiErrorResponse> | null): string[] {
  const codes = Array.isArray(body?.errors)
    ? body.errors.filter((code): code is string => typeof code === 'string')
    : [];

  return codes.length > 0 ? codes : ['DEFAULT_API_ERROR'];
}

export async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as Partial<ApiErrorResponse> | null;

  return new ApiError(response.status, extractErrorCodes(body));
}
