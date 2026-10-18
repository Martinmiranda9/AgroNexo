'use client';

import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { MdCheck } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere RadioGroup (registro `cashmere/radio-group-base`): hueco suave y punto plano al marcar.
 * `RadioCard` es la "Checkbox Cards" de la vitrina de Cashmere (label con borde, control a la izquierda,
 * título y bajada) armada con este RadioGroup: elección única con aspecto de card. AgroNexo: lo seleccionado
 * es pine (borde de la card y relleno del control, con el check en beige).
 */

type WithClassName<P> = Omit<P, 'className'> & { className?: string };

const RadioGroup = React.forwardRef<HTMLDivElement, WithClassName<RadioGroupPrimitive.Props>>(
  ({ className, ...props }, ref) => (
    <RadioGroupPrimitive
      data-slot="radio-group"
      ref={ref}
      className={cn('grid gap-2', className)}
      {...props}
    />
  )
);
RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  WithClassName<RadioPrimitive.Root.Props>
>(({ className, ...props }, ref) => (
  <RadioPrimitive.Root
    data-slot="radio-group-item"
    ref={ref}
    className={cn(
      'border-input-border aspect-square size-4 shrink-0 rounded-full border',
      'bg-input [box-shadow:var(--shadow-inset)]',
      'transition-[background-color,box-shadow,border-color] duration-150',
      'hover:border-ring/60',
      'focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      'data-checked:border-pine',
      className
    )}
    {...props}
  >
    <RadioPrimitive.Indicator
      data-slot="radio-group-indicator"
      className="flex size-full items-center justify-center"
    >
      <span className="bg-pine size-2 rounded-full [box-shadow:var(--shadow-primary)]" />
    </RadioPrimitive.Indicator>
  </RadioPrimitive.Root>
));
RadioGroupItem.displayName = 'RadioGroupItem';

interface RadioCardProps extends Omit<WithClassName<RadioPrimitive.Root.Props>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Ícono Material de la opción, en una baldosa con borde; se pinta de pine al elegirla. */
  icon?: React.ReactNode;
  /**
   * `row`: ícono, texto y control en una fila (cards anchas; sin ícono, el control va primero). `stacked`: ícono arriba a la izquierda y control
   * arriba a la derecha, con el título y la bajada debajo, para cards angostas de grilla.
   */
  layout?: 'row' | 'stacked';
}

/** Opción con aspecto de card ("Checkbox Cards" de Cashmere) para usar dentro de `RadioGroup`. */
const RadioCard = React.forwardRef<HTMLButtonElement, RadioCardProps>(
  ({ className, title, description, icon, layout = 'row', ...props }, ref) => {
    const id = React.useId();
    const stacked = layout === 'stacked';
    // Con ícono, la card gana aire y jerarquía (título 16px sobre bajada 14px); sin ícono queda compacta.
    const rich = Boolean(icon);

    const control = (
      <RadioPrimitive.Root
        id={id}
        ref={ref}
        data-slot="radio-card-control"
        className={cn(
          'peer border-input-border size-4 shrink-0 rounded-full border',
          'bg-input [box-shadow:var(--shadow-inset)]',
          'transition-[background-color,box-shadow,border-color] duration-150',
          'focus-visible:outline-none',
          'data-checked:bg-pine data-checked:border-pine data-checked:text-sage-50 data-checked:[box-shadow:var(--shadow-primary)]'
        )}
        {...props}
      >
        <RadioPrimitive.Indicator className="flex size-full items-center justify-center text-current">
          <MdCheck className="size-3" aria-hidden />
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Root>
    );

    const iconTile = icon && (
      <span
        aria-hidden
        data-slot="radio-card-icon"
        className={cn(
          'border-border bg-card text-foreground flex size-10 shrink-0 items-center justify-center rounded-md border',
          '[box-shadow:var(--shadow-xs)] transition-colors [&_svg]:size-5',
          'group-has-data-checked/radio-card:border-pine/30 group-has-data-checked/radio-card:text-pine'
        )}
      >
        {icon}
      </span>
    );

    const text = (
      <div className="min-w-0 flex-1">
        <div className={cn('text-foreground font-medium', rich ? 'text-body' : 'text-sm')}>
          {title}
        </div>
        {description && (
          <div className={cn('text-muted-foreground', rich ? 'text-body-sm mt-0.5' : 'text-sm')}>
            {description}
          </div>
        )}
      </div>
    );

    return (
      <label
        htmlFor={id}
        data-slot="radio-card"
        data-layout={layout}
        className={cn(
          'group/radio-card bg-card border-border flex cursor-pointer rounded-lg border transition-colors',
          rich ? 'hover:border-input-border p-4' : 'px-3 py-2.5',
          stacked ? 'flex-col gap-3' : rich ? 'items-center gap-4' : 'items-center gap-3',
          'has-data-checked:border-pine has-focus-visible:ring-ring/40 has-focus-visible:ring-2',
          'has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50',
          className
        )}
      >
        {stacked ? (
          <>
            <div className="flex items-start justify-between gap-3">
              {iconTile}
              {control}
            </div>
            {text}
          </>
        ) : icon ? (
          <>
            {iconTile}
            {text}
            {control}
          </>
        ) : (
          <>
            {control}
            {text}
          </>
        )}
      </label>
    );
  }
);
RadioCard.displayName = 'RadioCard';

export { RadioGroup, RadioGroupItem, RadioCard };
