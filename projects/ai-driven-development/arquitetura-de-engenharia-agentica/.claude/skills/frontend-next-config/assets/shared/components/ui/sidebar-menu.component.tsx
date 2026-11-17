'use client';
import { Circle } from 'lucide-react';
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { AppLogo } from '@/shared/components/branding/app-logo.component';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { usePathname } from 'next/navigation';
import { useShell } from '@/shared/hooks/shell.hook';
import { useState, type ComponentType } from 'react';
import Link from 'next/link';
type SidebarIcon = ComponentType<{ className?: string }>;

export type SidebarMenuItem = {
  id: string;
  label: string;
  shortLabel?: string;
  href: string;
  icon?: SidebarIcon;
  match?: 'exact' | 'prefix';
  excludeHrefs?: string[];
};

export type SidebarMenuSection = {
  id: string;
  label?: string;
  items: SidebarMenuItem[];
};

export type ModuleNavigationEntry = {
  item: SidebarMenuItem;
  mainItem?: SidebarMenuItem;
  sections: SidebarMenuSection[];
};

export type SidebarMenuProps = {
  mainItem?: SidebarMenuItem;
  sections: SidebarMenuSection[];
  collapsed?: boolean;
  moduleNavigation?: {
    activeModuleId: string;
    items: ModuleNavigationEntry[];
  };
};

const ITEM_BASE_CLASS =
  'group relative box-border flex h-11 w-full max-w-full items-center gap-3 rounded-xl px-3 text-[15px] text-zinc-300 transition-all duration-200 hover:bg-white/6 hover:text-zinc-100';
const COLLAPSED_CLASS = 'justify-center px-2';
// Previous active treatment used `to-primary/18` before switching to a menu-matched accent.
const ACTIVE_CLASS =
  'border border-white/10 bg-linear-to-r from-white/10 via-white/6 to-zinc-800/70 text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';
const MODULE_RAIL_ITEM_CLASS =
  'group relative flex h-11 items-center justify-center rounded-xl px-0 text-zinc-400 transition-all duration-200 hover:bg-white/6 hover:text-zinc-100 xl:h-auto xl:min-h-16 xl:flex-col xl:gap-1.5 xl:rounded-2xl xl:px-2 xl:py-2 xl:text-center xl:text-[11px] xl:leading-3.5';
const MENU_HEADER_HEIGHT_CLASS = 'h-16';

function joinClassNames(values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function isItemActive(pathname: string, item: SidebarMenuItem) {
  if (item.excludeHrefs?.some((excludedHref) => pathname === excludedHref || pathname.startsWith(`${excludedHref}/`))) {
    return false;
  }

  if (item.match === 'exact') {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarItemLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: SidebarMenuItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon ?? Circle;
  const link = (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={joinClassNames([ITEM_BASE_CLASS, collapsed && COLLAPSED_CLASS, active && ACTIVE_CLASS])}
    >
      <Icon className="size-4 shrink-0" />
      <span className={joinClassNames(['truncate', collapsed && 'sr-only'])}>{item.label}</span>
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

function ModuleRailItem({ item, active }: { item: SidebarMenuItem; active: boolean }) {
  const Icon = item.icon ?? Circle;
  const link = (
    <Link
      href={item.href}
      aria-label={item.label}
      className={joinClassNames([MODULE_RAIL_ITEM_CLASS, active && ACTIVE_CLASS])}
    >
      <Icon className="size-4 shrink-0" />
      <span className="hidden wrap-break-word xl:block">{item.shortLabel ?? item.label}</span>
    </Link>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

function MenuSections({
  sections,
  pathname,
  isCollapsed,
  onNavigate,
}: {
  sections: SidebarMenuSection[];
  pathname: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id}>
          {section.label && !isCollapsed ? (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              {section.label}
            </p>
          ) : null}

          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarItemLink
                key={item.id}
                item={item}
                active={isItemActive(pathname, item)}
                collapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ModuleFlyoutContent({
  entry,
  pathname,
  onNavigate,
}: {
  entry: ModuleNavigationEntry;
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="w-full py-2">
      {entry.mainItem ? (
        <>
          <div className="space-y-1">
            <SidebarItemLink
              item={entry.mainItem}
              active={isItemActive(pathname, entry.mainItem)}
              collapsed={false}
              onNavigate={onNavigate}
            />
          </div>
          <div className="my-4 h-px bg-white/8" />
        </>
      ) : null}

      <MenuSections sections={entry.sections} pathname={pathname} isCollapsed={false} onNavigate={onNavigate} />
    </div>
  );
}

function CollapsedModuleItem({
  entry,
  pathname,
  active,
  open,
  onOpenChange,
}: {
  entry: ModuleNavigationEntry;
  pathname: string;
  active: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = entry.item.icon ?? Circle;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={entry.item.label}
          className={joinClassNames([
            'group relative flex h-11 w-full items-center justify-center rounded-xl text-zinc-400 transition-all duration-200 hover:bg-white/6 hover:text-zinc-100',
            active && ACTIVE_CLASS,
          ])}
        >
          <Icon className="size-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="rounded-2xl border-white/10 bg-zinc-950/96 p-2 text-zinc-100 shadow-2xl backdrop-blur-xl"
        onMouseLeave={() => onOpenChange(false)}
      >
        <PopoverArrow className="fill-zinc-950/96 stroke-white/10 stroke-[1px]" width={10} height={10} />
        <ModuleFlyoutContent entry={entry} pathname={pathname} onNavigate={() => onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  );
}

export function SidebarMenu({ mainItem, sections, collapsed, moduleNavigation }: SidebarMenuProps) {
  const pathname = usePathname();
  const { isMobile, isSidebarOpen } = useShell();
  const isCollapsed = collapsed ?? (!isMobile && !isSidebarOpen);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const showTwoLevelNavigation = Boolean(moduleNavigation) && !isCollapsed;
  const defaultModuleHref = moduleNavigation?.items[0]?.item.href ?? '/';
  const moduleSections = moduleNavigation
    ? [
        {
          id: 'app-modules',
          label: 'Módulos',
          items: moduleNavigation.items.map((entry) => entry.item),
        },
      ]
    : [];

  if (showTwoLevelNavigation && moduleNavigation) {
    return (
      <nav className="flex min-h-full gap-2 px-2 pb-4 xl:gap-3 xl:pb-4">
        <div className="flex w-[3.15rem] shrink-0 flex-col xl:w-16">
          <Link
            href={defaultModuleHref}
            aria-label="Ir para dashboard"
            className={joinClassNames([
              MENU_HEADER_HEIGHT_CLASS,
              'flex items-center justify-center border-b border-white/8',
            ])}
          >
            <AppLogo size="md" showText={false} priority />
          </Link>

          <div className="h-3 shrink-0" />

          <div className="min-h-0 flex-1 space-y-1">
            {moduleNavigation.items.map((entry) => (
              <ModuleRailItem
                key={entry.item.id}
                item={entry.item}
                active={entry.item.id === moduleNavigation.activeModuleId}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 border-l border-white/8 pl-2 xl:max-w-[16rem] xl:pl-3">
          <Link
            href={defaultModuleHref}
            aria-label="Ir para dashboard"
            className={joinClassNames([MENU_HEADER_HEIGHT_CLASS, 'flex items-center border-b border-white/8 px-2'])}
          >
            <AppLogo size="md" showMark={false} priority />
          </Link>

          <div className="h-3 shrink-0" />

          {mainItem ? (
            <>
              <div className="space-y-1">
                <SidebarItemLink item={mainItem} active={isItemActive(pathname, mainItem)} collapsed={false} />
              </div>
              <div className="my-4 h-px bg-white/8" />
            </>
          ) : null}

          <MenuSections sections={sections} pathname={pathname} isCollapsed={false} />
        </div>
      </nav>
    );
  }

  if (moduleNavigation && isCollapsed) {
    return (
      <nav className="px-2 pb-4">
        <div
          className={joinClassNames([
            MENU_HEADER_HEIGHT_CLASS,
            'mb-3 flex items-center justify-center border-b border-white/8',
          ])}
        >
          <Link href={defaultModuleHref} aria-label="Ir para dashboard" className="flex items-center justify-center">
            <AppLogo size="md" showText={false} priority />
          </Link>
        </div>

        <div className="space-y-1">
          {moduleNavigation.items.map((entry) => (
            <CollapsedModuleItem
              key={entry.item.id}
              entry={entry}
              pathname={pathname}
              active={entry.item.id === moduleNavigation.activeModuleId}
              open={openModuleId === entry.item.id}
              onOpenChange={(open) => setOpenModuleId(open ? entry.item.id : null)}
            />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="px-2 py-4">
      {moduleNavigation ? (
        <>
          <MenuSections sections={moduleSections} pathname={pathname} isCollapsed={isCollapsed} />
          {mainItem || sections.length > 0 ? <div className="my-4 h-px bg-white/8" /> : null}
        </>
      ) : null}

      {mainItem ? (
        <>
          <div className="space-y-1">
            <SidebarItemLink item={mainItem} active={isItemActive(pathname, mainItem)} collapsed={isCollapsed} />
          </div>
          <div className="my-4 h-px bg-white/8" />
        </>
      ) : null}

      <MenuSections sections={sections} pathname={pathname} isCollapsed={isCollapsed} />
    </nav>
  );
}
