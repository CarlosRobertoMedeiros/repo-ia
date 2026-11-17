'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getMessage } from '@/shared/i18n';
import type { ApiErrorResponse } from '@/shared/types/api-error.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function extractErrorCodes(body: Partial<ApiErrorResponse> | null): string[] {
  const codes = Array.isArray(body?.errors)
    ? body.errors.filter((code): code is string => typeof code === 'string')
    : [];

  return codes.length > 0 ? codes : ['DEFAULT_API_ERROR'];
}

export function RegisterForm() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    };

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(getMessage('AUTH_REGISTER_SUCCESS'));
        form.reset();
        return;
      }

      const body = (await response.json().catch(() => null)) as Partial<ApiErrorResponse> | null;

      for (const code of extractErrorCodes(body)) {
        toast.error(getMessage(code));
      }
    } catch {
      toast.error(getMessage('DEFAULT_API_ERROR'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <Label htmlFor="register-name">Nome</Label>
        <Input
          id="register-name"
          name="name"
          autoComplete="name"
          placeholder="Maria da Silva"
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <div>
        <Label htmlFor="register-email">E-mail</Label>
        <Input
          id="register-email"
          name="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <div>
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-amber-400 font-bold text-black hover:bg-amber-300"
      >
        {submitting ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </form>
  );
}
