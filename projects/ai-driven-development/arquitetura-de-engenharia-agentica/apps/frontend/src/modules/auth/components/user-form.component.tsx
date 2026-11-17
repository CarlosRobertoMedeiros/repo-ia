'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { FormSectionLayout } from '@/shared/components/ui/form-section-layout';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getMessage } from '@/shared/i18n';
import type { SaveUserPayload } from '../util/user-api.util';

type UserFormProps = {
  isEditing: boolean;
  initialValues?: { name: string; email: string };
  submitting?: boolean;
  onSubmit: (payload: SaveUserPayload) => void;
  cancelHref: string;
};

/** Formulario compartilhado entre criacao e edicao de usuario. */
export function UserForm({
  isEditing,
  initialValues,
  submitting = false,
  onSubmit,
  cancelHref,
}: UserFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    const confirmation = String(data.get('passwordConfirmation') ?? '');

    // A confirmacao de senha e responsabilidade do front-end.
    if (password !== confirmation) {
      toast.error(getMessage('user.password.confirmation.mismatch'));
      return;
    }

    onSubmit({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      // Em edicao, senha vazia = manter a senha atual (nao enviar o campo).
      ...(password ? { password } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <FormSectionLayout title="Dados básicos" description="Nome e e-mail de acesso do usuário.">
        <div>
          <Label htmlFor="user-name">Nome</Label>
          <Input
            id="user-name"
            name="name"
            autoComplete="off"
            placeholder="Maria da Silva"
            defaultValue={initialValues?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="user-email">E-mail</Label>
          <Input
            id="user-email"
            name="email"
            autoComplete="off"
            placeholder="maria@exemplo.com"
            defaultValue={initialValues?.email}
            required
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout
        title="Senha"
        description={
          isEditing
            ? 'Deixe os campos em branco para manter a senha atual.'
            : 'Defina a senha de acesso e confirme-a.'
        }
        showDivider={false}
      >
        <div>
          <Label htmlFor="user-password">Senha</Label>
          <Input
            id="user-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="user-password-confirmation">Confirmação da senha</Label>
          <Input
            id="user-password-confirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            required={!isEditing}
          />
        </div>
      </FormSectionLayout>

      <div className="flex justify-end gap-3">
        <Button asChild type="button" variant="secondary">
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
