'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { MdCheck } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere Checkbox (registro `cashmere/checkbox-base`): hueco suave cuando está vacío y relleno plano cuando
 * está marcado. AgroNexo: lo seleccionado es pine con el check en beige (no el color del botón).
 */
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-input-border relative size-4 shrink-0 rounded-sm border',
        'bg-input [box-shadow:var(--shadow-inset)]',
        'transition-[background-color,box-shadow,border-color] duration-150',
        'hover:border-ring/60',
        'focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50',
        'aria-invalid:border-destructive',
        'data-checked:bg-pine data-checked:border-pine data-checked:text-sage-50 data-checked:[box-shadow:var(--shadow-primary)]',
        // Área táctil más grande que el cuadro visible.
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex size-full items-center justify-center text-current"
      >
        <MdCheck className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

interface CheckboxCardProps extends Omit<CheckboxPrimitive.Root.Props, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * "Checkbox Cards" de la vitrina de Cashmere: label con borde, el checkbox a la izquierda, título y bajada.
 * Lo marcado se resalta con el borde en pine.
 */
function CheckboxCard({ className, title, description, ...props }: CheckboxCardProps) {
  const id = React.useId();
  return (
    <label
      htmlFor={id}
      data-slot="checkbox-card"
      className={cn(
        'bg-card border-border flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
        'has-data-checked:border-pine has-focus-visible:ring-ring/40 has-focus-visible:ring-2',
        'has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50',
        typeof className === 'string' ? className : undefined
      )}
    >
      <Checkbox id={id} {...props} />
      <div className="min-w-0">
        <div className="text-foreground text-sm font-medium">{title}</div>
        {description && <div className="text-muted-foreground text-sm">{description}</div>}
      </div>
    </label>
  );
}

export { Checkbox, CheckboxCard };
