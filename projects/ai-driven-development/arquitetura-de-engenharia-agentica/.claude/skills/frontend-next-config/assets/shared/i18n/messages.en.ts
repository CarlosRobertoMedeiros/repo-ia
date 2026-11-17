import type { ErrorMessages } from './messages.pt';

export const errorMessagesEn: ErrorMessages = {
  DEFAULT_API_ERROR: 'An unexpected error occurred while contacting the server.',
  INVALID_ARRAY: 'The value must be an array.',
  INVALID_ITEM: 'Invalid item.',
  INVALID_OBJECT: 'The value must be an object.',
  INVALID_VALUE: 'Invalid value.',
  MAX_ITEMS: 'Maximum of {{max}} items.',
  MIN_ITEMS: 'Minimum of {{min}} items.',
  REQUIRED_FIELD: 'This field is required.',
  SHELL_CONTEXT_PROVIDER_REQUIRED: 'useShellContext must be used within <ShellProvider>.',
  UNKNOWN_ERROR_CODE: 'Unknown error: {{code}}',
};
