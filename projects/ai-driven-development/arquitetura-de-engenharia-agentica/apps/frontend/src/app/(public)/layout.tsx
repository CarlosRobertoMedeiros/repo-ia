'use client';

/**
 * TEMPLATE — app/(public)/layout.tsx
 *
 * Layout do grupo de rotas públicas.
 * Usa PublicBoxedLayout para todas as rotas, exceto /auth/* que renderiza sem wrapper.
 *
 * Ajuste o prefixo isAuthRoute conforme as rotas de autenticação do projeto.
 */

import { usePathname } from 'next/navigation';
import { PublicBoxedLayout } from '@/shared/template/public-boxed-layout.component';

export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/join' || pathname.startsWith('/join/');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return <PublicBoxedLayout>{children}</PublicBoxedLayout>;
}
