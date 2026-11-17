'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/class-name.util';

type ReadonlyTextFieldProps = {
  id?: string;
  value?: string | number | null;
  className?: string;
  copyable?: boolean;
  copyValue?: string;
  copyLabel?: string;
};

export function ReadonlyTextField({
  id,
  value,
  className,
  copyable = false,
  copyValue,
  copyLabel = 'Copiar valor',
}: ReadonlyTextFieldProps) {
  const normalizedValue = value === undefined || value === null || value === '' ? '-' : String(value);
  const [copied, setCopied] = useState(false);
  const contentToCopy = copyValue ?? (value === undefined || value === null ? '' : String(value));

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    if (!contentToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        id={id}
        aria-readonly="true"
        className={cn(
          'pointer-events-none flex h-10 w-full cursor-default items-center rounded-md border border-input bg-muted/35 px-3 py-2 text-sm text-muted-foreground select-none',
          className,
        )}
      >
        <span className="block min-w-0 truncate">{normalizedValue}</span>
      </div>

      {copyable ? (
        <Button
          type="button"
          size="icon"
          variant={copied ? 'secondary' : 'outline'}
          onClick={handleCopy}
          disabled={!contentToCopy}
          aria-label={copyLabel}
          title={copyLabel}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      ) : null}
    </div>
  );
}
