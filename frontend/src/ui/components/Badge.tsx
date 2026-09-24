import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'positive' | 'alert' | 'error' | 'inverse';
  /** Icono a la izquierda (Phosphor, ~12px). */
  icon?: React.ReactNode;
  /** Punto de estado con pulso, en lugar de icono. */
  dot?: boolean;
}

const VARIANTS = {
  neutral: 'bg-pine/8 text-pine',
  positive: 'bg-primary/12 text-pine',
  alert: 'bg-neutral-warm/20 text-dark',
  error: 'bg-danger/10 text-danger',
  /** Para fondos Pine / gradiente. */
  inverse: 'bg-beige/10 text-beige ring-1 ring-beige/25 backdrop-blur-md',
} as const;

const DOT = {
  neutral: 'bg-pine',
  positive: 'bg-primary',
  alert: 'bg-neutral-warm',
  error: 'bg-danger',
  inverse: 'bg-accent-light',
} as const;

/** Badge / Tag del Design System. Siempre pill. */
export default function Badge({ variant = 'neutral', icon, dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-semibold leading-none',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {dot ? <i aria-hidden className={cn('h-1.5 w-1.5 animate-pulse rounded-full', DOT[variant])} /> : icon}
      {children}
    </span>
  );
}
