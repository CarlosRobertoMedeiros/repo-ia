import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/class-name.util';

type FormSectionLayoutProps = {
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  showDivider?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export function FormSectionLayout({
  title,
  description,
  aside,
  showDivider = true,
  className,
  contentClassName,
  children,
}: FormSectionLayoutProps) {
  return (
    <section
      className={cn(
        'grid grid-cols-1 gap-x-8 gap-y-6 pb-10 md:grid-cols-3 md:gap-y-10',
        showDivider ? 'border-b border-border/80' : '',
        className,
      )}
    >
      <div className="space-y-1 md:space-y-0">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        {aside ? <div className="mt-4">{aside}</div> : null}
      </div>

      <div className={cn('grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 md:col-span-2', contentClassName)}>{children}</div>
    </section>
  );
}
