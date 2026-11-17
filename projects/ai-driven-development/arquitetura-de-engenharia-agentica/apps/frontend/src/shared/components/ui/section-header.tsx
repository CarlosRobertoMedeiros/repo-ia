import type { ReactNode } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/class-name.util';

type SectionHeaderProps = {
  badge?: ReactNode;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  divider?: boolean;
  className?: string;
  dividerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function SectionHeader({
  badge,
  title,
  subtitle,
  aside,
  divider = false,
  className,
  dividerClassName,
  contentClassName,
  titleClassName,
  subtitleClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {divider ? <div className={cn('h-px w-full bg-border/70', dividerClassName)} aria-hidden="true" /> : null}

      <header className="space-y-2">
        {badge ? (
          <Badge variant="secondary" className="px-2.5 py-1 text-[13px] font-semibold">
            {badge}
          </Badge>
        ) : null}

        <div
          className={cn(
            aside ? 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between' : 'space-y-1',
            contentClassName,
          )}
        >
          <div className="flex flex-col space-y-1">
            <h2
              className={cn(
                'inline-block w-fit self-start bg-linear-to-r from-white to-zinc-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent',
                titleClassName,
              )}
            >
              {title}
            </h2>

            {subtitle ? <p className={cn('text-sm text-zinc-400', subtitleClassName)}>{subtitle}</p> : null}
          </div>

          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </header>
    </div>
  );
}
