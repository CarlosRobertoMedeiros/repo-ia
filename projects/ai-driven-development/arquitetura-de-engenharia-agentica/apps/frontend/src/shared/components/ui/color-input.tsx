import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/class-name.util';

type ColorInputProps = {
  id?: string;
  value?: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

function normalizeToPickerValue(value?: string): string {
  const normalized = value?.trim() ?? '';
  if (!normalized) {
    return '#000000';
  }

  const withPrefix = normalized.startsWith('#') ? normalized : `#${normalized}`;
  const plain = withPrefix.slice(1);

  if (/^[0-9A-Fa-f]{3}$/.test(plain)) {
    const expanded = plain
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
    return `#${expanded.toUpperCase()}`;
  }

  if (/^[0-9A-Fa-f]{6}$/.test(plain)) {
    return `#${plain.toUpperCase()}`;
  }

  if (/^[0-9A-Fa-f]{8}$/.test(plain)) {
    return `#${plain.slice(0, 6).toUpperCase()}`;
  }

  return '#000000';
}

export function ColorInput({ id, value, onChange, disabled, placeholder = '#22C55E', className }: ColorInputProps) {
  const pickerValue = normalizeToPickerValue(value);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md border border-input bg-background">
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: pickerValue }} />
        <input
          type="color"
          value={pickerValue}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          aria-label="Selecionar cor"
        />
      </div>

      <Input
        id={id}
        value={value ?? ''}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
      />
    </div>
  );
}
