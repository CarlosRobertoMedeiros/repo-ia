export const errorMessagesPt = {
  DEFAULT_API_ERROR: 'Ocorreu um erro inesperado na comunicação com o servidor.',
  INVALID_ARRAY: 'O valor deve ser uma lista.',
  INVALID_ITEM: 'Item inválido.',
  INVALID_OBJECT: 'O valor deve ser um objeto.',
  INVALID_VALUE: 'Valor inválido.',
  MAX_ITEMS: 'Máximo de {{max}} itens.',
  MIN_ITEMS: 'Mínimo de {{min}} itens.',
  REQUIRED_FIELD: 'Campo de preenchimento obrigatório.',
  SHELL_CONTEXT_PROVIDER_REQUIRED: 'useShellContext deve ser usado dentro de <ShellProvider>.',
  UNKNOWN_ERROR_CODE: 'Erro desconhecido: {{code}}',
} as const;

export type ErrorMessageKey = keyof typeof errorMessagesPt;
export type ErrorMessages = Record<ErrorMessageKey, string>;
