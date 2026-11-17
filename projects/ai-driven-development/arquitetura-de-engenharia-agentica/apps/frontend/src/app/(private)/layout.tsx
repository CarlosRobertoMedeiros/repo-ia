'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users } from 'lucide-react';
import { AuthGuard, useAuth } from '@/modules/auth';
import { ShellProvider } from '@/shared/context/shell.context';
import { AdminShell } from '@/shared/template/admin-shell.component';
import { AppSidebarNavigation } from '@/shared/navigation/app-sidebar-navigation.component';
import type { ModuleNavigationEntry } from '@/shared/components/ui/sidebar-menu.component';

// ── Rotas ─────────────────────────────────────────────────────────────────────

const EXAMPLE_ROUTE = '/example';
const EXAMPLE_DASHBOARD_ROUTE = `${EXAMPLE_ROUTE}/dashboard`;
const USERS_ROUTE = '/auth/users';
const PRODUCTS_ROUTE = '/catalog/products';

// ── Estrutura de navegação ─────────────────────────────────────────────────────
// Adicione, remova ou reordene módulos e seções aqui para refletir no menu lateral.

const APP_MODULES: ModuleNavigationEntry[] = [
  {
    item: {
      id: 'example',
      label: 'Exemplo',
      shortLabel: 'Ex',
      href: EXAMPLE_DASHBOARD_ROUTE,
      icon: LayoutDashboard,
    },
    sections: [
      {
        id: 'example-main',
        label: 'Exemplo',
        items: [
          {
            id: 'example-dashboard',
            label: 'Dashboard',
            href: EXAMPLE_DASHBOARD_ROUTE,
            icon: LayoutDashboard,
            match: 'exact',
          },
        ],
      },
    ],
  },
  {
    item: {
      id: 'users',
      label: 'Usuários',
      shortLabel: 'Us',
      href: USERS_ROUTE,
      icon: Users,
    },
    sections: [
      {
        id: 'users-main',
        label: 'Usuários',
        items: [
          {
            id: 'users-list',
            label: 'Usuários',
            href: USERS_ROUTE,
            icon: Users,
            match: 'prefix',
          },
        ],
      },
    ],
  },
  {
    item: {
      id: 'products',
      label: 'Produtos',
      shortLabel: 'Pr',
      href: PRODUCTS_ROUTE,
      icon: Package,
    },
    sections: [
      {
        id: 'products-main',
        label: 'Catálogo',
        items: [
          {
            id: 'products-list',
            label: 'Produtos',
            href: PRODUCTS_ROUTE,
            icon: Package,
            match: 'prefix',
          },
        ],
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────

export default function PrivateGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/join');
  }

  return (
    <AuthGuard>
      <ShellProvider defaultOpen>
        <AdminShell
          sidebar={<AppSidebarNavigation modules={APP_MODULES} defaultModuleId="example" />}
          userName={user?.name}
          userEmail={user?.email}
          onLogout={handleLogout}
        >
          {children}
        </AdminShell>
      </ShellProvider>
    </AuthGuard>
  );
}
