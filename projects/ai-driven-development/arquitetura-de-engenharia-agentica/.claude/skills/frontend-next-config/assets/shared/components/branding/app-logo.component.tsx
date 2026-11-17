import { Layers } from 'lucide-react';
import { cn } from '@/shared/lib/class-name.util';

// Substitua APP_NAME pelo nome do seu app (Fase 3c da skill).
const APP_NAME = 'Aplicação';

type LogoSize = 'sm' | 'md' | 'lg';

const markIconSizeClasses: Record<LogoSize, string> = {
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-7',
};

const textSizeClasses: Record<LogoSize, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

const gapClasses: Record<LogoSize, string> = {
  sm: 'gap-2',
  md: 'gap-2.5',
  lg: 'gap-3',
};

type AppLogoMarkProps = {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
};

type AppWordmarkProps = {
  size?: LogoSize;
  className?: string;
};

type AppLogoProps = {
  size?: LogoSize;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showMark?: boolean;
  showText?: boolean;
  withText?: boolean;
  priority?: boolean;
};

export function AppLogoMark({ size = 'md', className }: AppLogoMarkProps) {
  return <Layers className={cn(markIconSizeClasses[size], 'shrink-0 text-white', className)} />;
}

export function AppWordmark({ size = 'md', className }: AppWordmarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium leading-none tracking-normal',
        textSizeClasses[size],
        className,
      )}
    >
      {APP_NAME}
    </span>
  );
}

export function AppLogo({
  size = 'md',
  className,
  markClassName,
  textClassName,
  showMark = true,
  showText,
  withText = true,
  priority: _priority,
}: AppLogoProps) {
  const shouldShowText = showText ?? withText;

  return (
    <span className={cn('inline-flex items-center', gapClasses[size], className)}>
      {showMark ? <AppLogoMark size={size} className={markClassName} /> : null}
      {shouldShowText ? <AppWordmark size={size} className={textClassName} /> : null}
    </span>
  );
}
