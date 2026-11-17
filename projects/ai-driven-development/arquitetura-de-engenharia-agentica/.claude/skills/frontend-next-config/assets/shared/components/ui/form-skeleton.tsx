import { cn } from '@/shared/lib/class-name.util';

type FormSkeletonProps = {
  sections?: number;
  rowsPerSection?: number;
  className?: string;
};

export function FormSkeleton({ sections = 1, rowsPerSection = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-12', className)}>
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <section
          key={`form-skeleton-section-${sectionIndex}`}
          className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border/80 pb-10 md:grid-cols-3"
          aria-hidden="true"
        >
          <div className="hidden space-y-3 md:block">
            <div className="h-5 w-36 animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-52 animate-pulse rounded bg-muted/50" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted/40" />
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 md:col-span-2">
            {Array.from({ length: rowsPerSection }).map((_, rowIndex) => (
              <div key={`form-skeleton-row-${sectionIndex}-${rowIndex}`} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted/45" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
