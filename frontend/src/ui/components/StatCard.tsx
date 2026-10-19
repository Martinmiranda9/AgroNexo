import * as React from 'react';
import { MdArrowDownward, MdArrowUpward, MdRemove } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { cashmereGrainStyle } from './_shared';

/*
 * Cashmere StatCard (registro `cashmere/stat-card-base`): rótulo, cifra protagonista y variación. AgroNexo:
 * - el ícono es un nodo (Material) en vez de un nombre de Iconify;
 * - suma `unit` (qq/ha, ha, $) al lado de la cifra y `action` (un Badge) arriba a la derecha;
 * - el rótulo va en sentence case, sin las mayúsculas espaciadas del registro (regla de Cashmere);
 * - la variación positiva usa el verde de estado (`success`) en vez de un oklch suelto;
 * - `tone`: `card` (la original), `tile` (casilla gris dentro de otra card, como las del tablero de referencia) y
 *   `brand` (la casilla destacada: el dato clave, en pine sólido con texto sage-50; el verde campo queda solo para
 *   el botón principal). En `tile` y `brand` el ícono va en un círculo.
 */
type StatCardTone = 'card' | 'tile' | 'brand';

const TONES: Record<StatCardTone, { root: string; label: string; muted: string; icon: string }> = {
  card: {
    root: 'bg-card text-card-foreground [box-shadow:var(--shadow-s)] hover:[box-shadow:var(--shadow-m)]',
    label: 'text-muted-foreground',
    muted: 'text-muted-foreground',
    icon: 'bg-muted text-primary rounded-lg [box-shadow:var(--shadow-s)]',
  },
  tile: {
    root: 'bg-surface-sunken text-card-foreground',
    label: 'text-muted-foreground',
    muted: 'text-muted-foreground',
    icon: 'bg-card text-foreground border-border rounded-full border',
  },
  brand: {
    root: 'bg-pine text-sage-50 [box-shadow:var(--shadow-s)]',
    label: 'text-sage-50/85',
    muted: 'text-sage-50/80',
    icon: 'bg-sage-50/10 text-sage-50 border-sage-50/25 rounded-full border',
  },
};

export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  change?: {
    value: string | number;
    direction?: 'up' | 'down' | 'neutral';
  };
  description?: React.ReactNode;
  tone?: StatCardTone;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      unit,
      icon,
      action,
      change,
      description,
      tone = 'card',
      style,
      ...props
    },
    ref
  ) => {
    const delta = change?.value;
    const direction = change?.direction ?? (typeof delta === 'number' && delta < 0 ? 'down' : 'up');
    const changeColor =
      direction === 'up'
        ? 'text-success-foreground'
        : direction === 'down'
          ? 'text-destructive'
          : 'text-muted-foreground';
    const ChangeIcon =
      direction === 'up' ? MdArrowUpward : direction === 'down' ? MdArrowDownward : MdRemove;
    const toneClasses = TONES[tone];

    return (
      <div
        ref={ref}
        data-slot="stat-card"
        data-tone={tone}
        style={{ ...cashmereGrainStyle, ...style }}
        className={cn(
          'rounded-xl p-5',
          'transition-[background-color,box-shadow] duration-200',
          toneClasses.root,
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className={cn('text-sm font-medium', toneClasses.label)}>{label}</div>
          {action}
          {icon && !action && (
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center [&_svg]:size-4',
                toneClasses.icon
              )}
            >
              {icon}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
          {unit && <span className={cn('text-base font-medium', toneClasses.muted)}>{unit}</span>}
        </div>
        {(change || description) && (
          <div className="mt-2 flex min-w-0 items-center gap-2 text-xs">
            {change && (
              <span className={cn('inline-flex items-center gap-0.5 font-medium', changeColor)}>
                <ChangeIcon className="size-3" aria-hidden />
                {change.value}
              </span>
            )}
            {description && (
              <span className={cn('flex min-w-0 items-center gap-2 truncate', toneClasses.muted)}>
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
StatCard.displayName = 'StatCard';

export { StatCard };
