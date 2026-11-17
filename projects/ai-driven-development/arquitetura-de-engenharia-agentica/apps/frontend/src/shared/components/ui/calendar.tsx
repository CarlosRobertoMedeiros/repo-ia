'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/class-name.util';
import 'react-day-picker/dist/style.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col gap-4 sm:flex-row',
        month: 'space-y-4',
        caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-sm font-semibold',
        nav: 'flex items-center gap-1',
        button_previous:
          'absolute left-1 inline-flex size-7 items-center justify-center rounded-md border border-input bg-background text-foreground transition hover:bg-accent',
        button_next:
          'absolute right-1 inline-flex size-7 items-center justify-center rounded-md border border-input bg-background text-foreground transition hover:bg-accent',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'w-9 text-[0.8rem] font-normal text-muted-foreground',
        week: 'mt-2 flex w-full',
        day: 'relative size-9 p-0 text-center text-sm',
        day_button:
          'inline-flex size-9 items-center justify-center rounded-md text-sm font-normal transition hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-40',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className={cn('size-4', iconClassName)} {...iconProps} />
          ) : (
            <ChevronRight className={cn('size-4', iconClassName)} {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}
