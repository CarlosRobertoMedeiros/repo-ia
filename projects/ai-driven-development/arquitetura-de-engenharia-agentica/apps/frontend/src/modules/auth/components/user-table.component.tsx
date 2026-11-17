'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import type { UserSummary } from '../util/user-api.util';

type UserTableProps = {
  users: UserSummary[];
  loading?: boolean;
  onDelete: (user: UserSummary) => void;
};

export function UserTable({ users, loading = false, onDelete }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead className="w-28 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
              {loading ? 'Carregando...' : 'Nenhum usuário cadastrado.'}
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label={`Editar ${user.name}`}>
                    <Link href={`/auth/users/${user.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${user.name}`}
                    className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
