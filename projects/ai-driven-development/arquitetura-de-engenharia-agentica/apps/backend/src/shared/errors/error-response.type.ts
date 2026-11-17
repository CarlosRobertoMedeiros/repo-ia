export type ApiErrorResponse = {
  statusCode: number;
  errors: string[];
  message?: string;
  details?: unknown;
  path?: string;
  timestamp: string;
};
