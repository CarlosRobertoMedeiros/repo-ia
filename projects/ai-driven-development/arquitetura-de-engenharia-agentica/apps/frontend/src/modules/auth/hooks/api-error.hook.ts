'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { getMessage } from '@/shared/i18n';
import { useAuth } from '../context/auth.context';
import { ApiError } from '../util/api-error.util';

/**
 * Padrao de erro das chamadas autenticadas: 401 encerra a sessao (o AuthGuard
 * leva para /join); os demais viram um toaster por codigo de `errors[]`.
 * Falhas de rede e erros inesperados usam a mensagem padrao.
 */
export function useApiErrorHandler() {
  const { logout } = useAuth();

  return useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          logout();
          return;
        }

        for (const code of error.codes) {
          toast.error(getMessage(code));
        }
        return;
      }

      toast.error(getMessage('DEFAULT_API_ERROR'));
    },
    [logout],
  );
}
