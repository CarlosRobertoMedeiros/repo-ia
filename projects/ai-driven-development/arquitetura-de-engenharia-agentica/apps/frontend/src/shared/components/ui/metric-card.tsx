import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/class-name.util';

type MetricCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  iconColorClassName?: string;
  className?: string;
  overlayClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  valueClassName?: string;
  iconContainerClassName?: string;
};

export function MetricCard({
  title,
  subtitle,
  value,
  icon,
  iconColorClassName,
  className,
  overlayClassName,
  headerClassName,
  contentClassName,
  titleClassName,
  subtitleClassName,
  valueClassName,
  iconContainerClassName,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-white/10 bg-linear-to-br from-zinc-900 via-zinc-900/95 to-zinc-800/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_120%_120%,rgba(245,158,11,0.12),transparent_52%)]',
          overlayClassName,
        )}
      />

      <CardHeader className={cn('relative space-y-0 pb-0.5', headerClassName)}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className={cn('truncate text-[15px] font-semibold text-zinc-100', titleClassName)}>
              {title}
            </CardTitle>
            {subtitle ? (
              <p className={cn('truncate text-xs leading-snug text-zinc-400', subtitleClassName)}>{subtitle}</p>
            ) : null}
          </div>

          {icon ? (
            <span
              className={cn(
                'shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400 [&_svg]:size-7',
                iconColorClassName,
                iconContainerClassName,
              )}
            >
              {icon}
            </span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={cn('relative -mt-3', contentClassName)}>
        <p className={cn('text-2xl md:text-3xl font-black tracking-tight text-zinc-100', valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  );
}
