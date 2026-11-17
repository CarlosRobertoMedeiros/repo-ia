'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { DynamicIcon, iconNames } from 'lucide-react/dynamic';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/class-name.util';

const ALL_ICON_NAMES = [...iconNames].sort((left, right) => left.localeCompare(right));

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]/g, '');
}

function normalizeIconName(value: string): string {
  return value.toLowerCase().replace(/[\s_]/g, '-');
}

type IconComboboxProps = {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  clearLabel?: string;
  maxResults?: number;
  disabled?: boolean;
  className?: string;
};

export function IconCombobox({
  id,
  value,
  onChange,
  placeholder = 'Selecionar ícone...',
  emptyText = 'Nenhum ícone encontrado.',
  searchPlaceholder = 'Pesquisar ícone por nome...',
  clearLabel = 'Sem ícone',
  maxResults = 120,
  disabled = false,
  className,
}: IconComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const normalizedSearch = normalizeSearchTerm(search);
  const normalizedCurrentValue = value ? normalizeIconName(value) : '';

  const selectedIconName = useMemo(() => {
    if (!normalizedCurrentValue) {
      return null;
    }

    return ALL_ICON_NAMES.find((iconName) => iconName === normalizedCurrentValue) ?? null;
  }, [normalizedCurrentValue]);

  const filteredIcons = useMemo(() => {
    if (!normalizedSearch) {
      return ALL_ICON_NAMES.slice(0, maxResults);
    }

    const matches = ALL_ICON_NAMES.filter((iconName) => normalizeSearchTerm(iconName).includes(normalizedSearch));
    return matches.slice(0, maxResults);
  }, [maxResults, normalizedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          className={cn('w-full justify-between', className)}
          disabled={disabled}
          aria-expanded={open}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedIconName ? <DynamicIcon name={selectedIconName} className="size-4 shrink-0" /> : null}
            <span className="truncate">
              {selectedIconName ? selectedIconName : value ? value : placeholder}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className="mb-2"
          autoComplete="off"
        />
        <div className="max-h-72 space-y-1 overflow-auto">
          <button
            type="button"
            onClick={() => {
              onChange?.('');
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
              !selectedIconName && !value && 'bg-accent',
            )}
          >
            <span>{clearLabel}</span>
            <Check className={cn('size-4', !selectedIconName && !value ? 'opacity-100' : 'opacity-0')} />
          </button>

          {filteredIcons.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            filteredIcons.map((iconName) => {
              const isSelected = iconName === selectedIconName;

              return (
                <button
                  type="button"
                  key={iconName}
                  onClick={() => {
                    onChange?.(iconName);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                    isSelected && 'bg-accent',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <DynamicIcon name={iconName} className="size-4 shrink-0" />
                    <span className="truncate">{iconName}</span>
                  </span>
                  <Check className={cn('size-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
