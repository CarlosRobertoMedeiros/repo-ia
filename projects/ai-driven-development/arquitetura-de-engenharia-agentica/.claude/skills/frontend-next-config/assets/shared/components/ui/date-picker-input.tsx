'use client';

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/class-name.util';

type DatePickerInputProps = {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function parseDateOnly(value?: string): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    const parsedDate = parseISO(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return undefined;
    }

    return parsedDate;
  } catch {
    return undefined;
  }
}

export function DatePickerInput({
  id,
  value,
  onChange,
  placeholder = 'Selecionar data',
  disabled = false,
  className,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = React.useMemo(() => parseDateOnly(value), [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-between border-input bg-background px-3 font-normal text-left hover:bg-accent/40',
            !selectedDate && 'text-muted-foreground',
            className,
          )}
        >
          <span>{selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}</span>
          <CalendarDays className="size-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              return;
            }

            onChange?.(format(date, 'yyyy-MM-dd'));
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
