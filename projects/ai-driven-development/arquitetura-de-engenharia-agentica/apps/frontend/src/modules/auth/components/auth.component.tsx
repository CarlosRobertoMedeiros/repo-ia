'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getMessage } from '@/shared/i18n';
import type { ApiErrorResponse } from '@/shared/types/api-error.type';
import { useAuth } from '../context/auth.context';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_PRIVATE_ROUTE = '/example/dashboard';

type LoginResponse = { token?: unknown };

function extractErrorCodes(body: Partial<ApiErrorResponse> | null): string[] {
  const codes = Array.isArray(body?.errors)
    ? body.errors.filter((code): code is string => typeof code === 'string')
    : [];

  return codes.length > 0 ? codes : ['DEFAULT_API_ERROR'];
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const payload = {
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    };

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const body = (await response.json().catch(() => null)) as LoginResponse | null;

        if (typeof body?.token === 'string') {
          login(body.token);
          router.push(DEFAULT_PRIVATE_ROUTE);
          return;
        }

        toast.error(getMessage('DEFAULT_API_ERROR'));
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
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          name="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <div>
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {submitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}

export default function AuthComponent() {
  return <h1>Auth Component</h1>;
}
