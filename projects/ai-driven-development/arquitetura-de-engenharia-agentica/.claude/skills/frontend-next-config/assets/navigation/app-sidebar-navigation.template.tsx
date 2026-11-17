'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenu, type ModuleNavigationEntry } from '@/shared/components/ui/sidebar-menu.component';

type Props = {
  modules: ModuleNavigationEntry[];
  defaultModuleId?: string;
};

export function AppSidebarNavigation({ modules, defaultModuleId }: Props) {
  const pathname = usePathname();

  const active =
    modules.find((m) => pathname === m.item.href || pathname.startsWith(`${m.item.href}/`)) ??
    modules.find((m) => m.item.id === defaultModuleId) ??
    modules[0];

  return (
    <SidebarMenu
      mainItem={active?.mainItem}
      sections={active?.sections ?? []}
      moduleNavigation={
        active
          ? { activeModuleId: active.item.id, items: modules }
          : undefined
      }
    />
  );
}
