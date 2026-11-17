'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { DeleteConfirmationDialog } from '@/shared/components/ui/delete-confirmation-dialog';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { PaginationControls } from '@/shared/components/ui/pagination-controls';
import { TableCard } from '@/shared/components/ui/table-card';
import { getMessage } from '@/shared/i18n';
import { UserTable } from '../components/user-table.component';
import { useAuth } from '../context/auth.context';
import { useApiErrorHandler } from '../hooks/api-error.hook';
import { deleteUser, listUsers, type UserPage, type UserSummary } from '../util/user-api.util';

const PER_PAGE = 10;

export default function UserListPage() {
  const { token, user: currentUser } = useAuth();
  const handleApiError = useApiErrorHandler();

  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<{ key: string; data: UserPage | null } | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestKey = `${page}:${reloadToken}`;
  const loading = result?.key !== requestKey;
  const data = result?.data ?? null;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const loaded = await listUsers(token, page, PER_PAGE);
        if (!cancelled) setResult({ key: requestKey, data: loaded });
      } catch (error) {
        if (cancelled) return;
        setResult({ key: requestKey, data: null });
        handleApiError(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, page, requestKey, handleApiError]);

  async function handleConfirmDelete() {
    if (!token || !userToDelete) return;

    setDeleting(true);

    try {
      await deleteUser(token, userToDelete.id);
      toast.success(getMessage('USER_DELETED'));
      setUserToDelete(null);

      if (data && data.items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setReloadToken((value) => value + 1);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setDeleting(false);
    }
  }

  const isDeletingSelf = userToDelete !== null && userToDelete.id === currentUser?.id;

  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Autenticação"
        title="Usuários"
        subtitle="Gerencie os usuários com acesso à aplicação."
        aside={
          <Button asChild>
            <Link href="/auth/users/new">
              <Plus className="size-4" />
              Novo usuário
            </Link>
          </Button>
        }
      />

      <TableCard
        footer={
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={data?.total}
            totalLabel="usuários"
            onPageChange={setPage}
            disabled={loading}
          />
        }
      >
        <UserTable users={data?.items ?? []} loading={loading} onDelete={setUserToDelete} />
      </TableCard>

      <DeleteConfirmationDialog
        open={userToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir usuário"
        description="Esta ação remove o usuário de forma permanente."
        itemLabel="Usuário"
        itemValue={userToDelete ? `${userToDelete.name} (${userToDelete.email})` : undefined}
        isConfirming={deleting}
        confirmDisabled={isDeletingSelf}
        confirmDisabledMessage={isDeletingSelf ? getMessage('USER_DELETE_SELF') : undefined}
      />
    </div>
  );
}
