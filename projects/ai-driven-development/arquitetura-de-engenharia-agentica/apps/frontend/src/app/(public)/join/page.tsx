'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { LoginForm } from '@/modules/auth/components/auth.component';
import { useAuth } from '@/modules/auth';
import { RegisterForm } from './register-form.component';

type JoinMode = 'register' | 'login';

const DEFAULT_PRIVATE_ROUTE = '/example/dashboard';

const COPY: Record<JoinMode, { subtitle: string; switchText: string; switchAction: string }> = {
  register: {
    subtitle: 'Crie sua conta para continuar',
    switchText: 'Já tem uma conta?',
    switchAction: 'Entrar',
  },
  login: {
    subtitle: 'Entre na sua conta para continuar',
    switchText: 'Ainda não tem conta?',
    switchAction: 'Cadastrar',
  },
};

export default function JoinPage() {
  const [mode, setMode] = useState<JoinMode>('register');
  const { status } = useAuth();
  const router = useRouter();
  const copy = COPY[mode];

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(DEFAULT_PRIVATE_ROUTE);
    }
  }, [status, router]);

  // Enquanto hidrata o cookie (ou ja autenticado e redirecionando), nao mostra o formulario.
  if (status !== 'unauthenticated') return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
            <Layers className="size-7 text-amber-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight">Aplicação</h1>
            <p className="mt-1 text-sm text-white/50">{copy.subtitle}</p>
          </div>
        </div>

        {mode === 'register' ? <RegisterForm /> : <LoginForm />}

        <p className="text-sm text-white/50">
          {copy.switchText}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className="font-semibold text-amber-400 transition-colors hover:text-amber-300"
          >
            {copy.switchAction}
          </button>
        </p>

        <Link
          href="/"
          className="text-xs text-white/30 transition-colors hover:text-white/60"
        >
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}
