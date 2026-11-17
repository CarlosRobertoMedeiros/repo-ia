'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { ShellProvider } from '@/shared/context/shell.context';
import { AdminShell } from '@/shared/template/admin-shell.component';
import { AppSidebarNavigation } from '@/shared/navigation/app-sidebar-navigation.component';
import type { ModuleNavigationEntry } from '@/shared/components/ui/sidebar-menu.component';

// ── Rotas ─────────────────────────────────────────────────────────────────────

const EXAMPLE_ROUTE = '/example';
const EXAMPLE_DASHBOARD_ROUTE = `${EXAMPLE_ROUTE}/dashboard`;

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
];

// ──────────────────────────────────────────────────────────────────────────────

export default function PrivateGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ShellProvider defaultOpen>
      {/* TODO: adicionar guard de autenticação se necessário */}
      <AdminShell
        sidebar={<AppSidebarNavigation modules={APP_MODULES} defaultModuleId="example" />}
        onLogout={() => router.push('/')}
      >
        {children}
      </AdminShell>
    </ShellProvider>
  );
}
