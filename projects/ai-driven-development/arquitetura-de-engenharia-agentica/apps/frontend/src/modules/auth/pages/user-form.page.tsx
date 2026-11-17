'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormSkeleton } from '@/shared/components/ui/form-skeleton';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { getMessage } from '@/shared/i18n';
import { UserForm } from '../components/user-form.component';
import { useAuth } from '../context/auth.context';
import { useApiErrorHandler } from '../hooks/api-error.hook';
import {
  createUser,
  getUser,
  updateUser,
  type SaveUserPayload,
  type UserSummary,
} from '../util/user-api.util';

const LIST_ROUTE = '/auth/users';

type UserFormPageProps = {
  /** Sem `userId` o formulario cria; com `userId` carrega e edita. */
  userId?: string;
};

export default function UserFormPage({ userId }: UserFormPageProps) {
  const router = useRouter();
  const { token } = useAuth();
  const handleApiError = useApiErrorHandler();

  const isEditing = userId !== undefined;
  const [loaded, setLoaded] = useState<{ id: string; user: UserSummary } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loading = isEditing && loaded?.id !== userId;

  useEffect(() => {
    if (!token || userId === undefined) return;

    let cancelled = false;

    (async () => {
      try {
        const user = await getUser(token, userId);
        if (!cancelled) setLoaded({ id: userId, user });
      } catch (error) {
        if (cancelled) return;
        handleApiError(error);
        router.replace(LIST_ROUTE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, userId, handleApiError, router]);

  async function handleSubmit(payload: SaveUserPayload) {
    if (!token) return;

    setSubmitting(true);

    try {
      if (userId === undefined) {
        await createUser(token, payload);
      } else {
        await updateUser(token, userId, payload);
      }

      toast.success(getMessage('USER_SAVED'));
      router.push(LIST_ROUTE);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageSectionHeader
        badge="Autenticação"
        title={isEditing ? 'Editar usuário' : 'Novo usuário'}
        subtitle={
          isEditing ? 'Altere os dados do usuário.' : 'Cadastre um novo usuário com acesso à aplicação.'
        }
      />

      {loading ? (
        <FormSkeleton sections={2} rowsPerSection={2} />
      ) : (
        <UserForm
          key={userId ?? 'new'}
          isEditing={isEditing}
          initialValues={loaded?.user}
          submitting={submitting}
          onSubmit={handleSubmit}
          cancelHref={LIST_ROUTE}
        />
      )}
    </div>
  );
}
