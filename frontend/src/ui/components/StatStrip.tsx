'use client';

import * as React from 'react';
import { MdArrowDownward, MdArrowUpward, MdOutlineInfo } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { Badge } from './Badge';
import { Card } from './Card';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';

/*
 * Tira de métricas (la fila "Total Product · Product Revenue · Product Sold" de la referencia de tabla): varias
 * cifras en una sola Card, separadas por líneas finas. Es la `StatCard` de Cashmere (rótulo, cifra, variación)
 * puesta en celdas de una misma superficie en vez de cards sueltas. AgroNexo:
 * - el rótulo puede traer `info`: un ícono con tooltip que explica qué cuenta la cifra;
 * - la variación va en pill clara de estado (verde sube, rojo baja, gris igual), nunca en verde de marca;
 * - en celular las celdas se apilan de a dos.
 */

const StatStrip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Card
      ref={ref}
      data-slot="stat-strip"
      className={cn('grid grid-cols-2 overflow-hidden lg:flex', className)}
      {...props}
    />
  )
);
StatStrip.displayName = 'StatStrip';

interface StatStripItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string;
  value: React.ReactNode;
  unit?: React.ReactNode;
  /** Qué cuenta la cifra: se lee en el tooltip del ícono de información. */
  info?: string;
  /** Texto chico debajo de la cifra ("esta semana", "de 380 ha"). */
  description?: React.ReactNode;
  change?: { value: string | number; direction?: 'up' | 'down' | 'neutral' };
}

const CHANGE = {
  up: { variant: 'success', Icon: MdArrowUpward },
  down: { variant: 'destructive', Icon: MdArrowDownward },
  neutral: { variant: 'secondary', Icon: null },
} as const;

const StatStripItem = React.forwardRef<HTMLDivElement, StatStripItemProps>(
  ({ className, label, value, unit, info, description, change, ...props }, ref) => {
    const direction =
      change?.direction ?? (typeof change?.value === 'number' && change.value < 0 ? 'down' : 'up');
    const { variant, Icon } = CHANGE[direction];

    return (
      <div
        ref={ref}
        data-slot="stat-strip-item"
        className={cn(
          'border-border flex min-w-0 flex-col gap-2 p-4 sm:p-5 lg:flex-1',
          // Líneas entre celdas: en celular, grilla de a dos; en escritorio, una fila.
          'even:border-l lg:border-l lg:first:border-l-0 [&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-t-0',
          className
        )}
        {...props}
      >
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
          <span className="truncate">{label}</span>
          {info && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label={`Qué es ${label.toLowerCase()}`}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 relative -m-1 flex size-6 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2"
                  />
                }
              >
                <MdOutlineInfo className="size-4" aria-hidden />
              </TooltipTrigger>
              <TooltipContent className="max-w-64">{info}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-foreground text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          {unit && <span className="text-muted-foreground text-base font-medium">{unit}</span>}
        </div>
        {(description || change) && (
          <div className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-2 text-xs">
            {description && <span className="truncate">{description}</span>}
            {change && (
              <Badge variant={variant} className="tabular-nums">
                {Icon && <Icon data-icon="inline-start" aria-hidden />}
                {change.value}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }
);
StatStripItem.displayName = 'StatStripItem';

export { StatStrip, StatStripItem };
