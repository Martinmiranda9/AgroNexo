'use client';

import * as React from 'react';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

import { toggleVariants } from './Toggle';

/*
 * Cashmere ToggleGroup (registro `cashmere/toggle-group-base`): un carril hundido con los ítems adentro. AgroNexo:
 * el ítem activo es pine + beige (regla de selección). `spacing` y `orientation` se conservan por compatibilidad.
 */
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing: _spacing,
  orientation = 'horizontal',
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: 'horizontal' | 'vertical';
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-orientation={orientation}
      className={cn(
        'inline-flex w-fit flex-wrap items-center gap-0.5 rounded-3xl p-1',
        'bg-card border-border border [box-shadow:var(--shadow-inset)]',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({ variant: context.variant || variant, size: context.size || size }),
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
