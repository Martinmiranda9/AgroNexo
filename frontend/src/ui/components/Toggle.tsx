'use client';

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere Toggle (registro `cashmere/toggle-base`). AgroNexo: lo activo es pine con texto beige, no el hueco
 * gris de Cashmere. `segmented` queda como alias de `default` para el ToggleGroup (que ya usaba la app).
 */
const toggleVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap',
    'transition-[background-color,color,box-shadow] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'disabled:pointer-events-none disabled:opacity-50',
    'hover:bg-accent hover:text-accent-foreground',
    'data-pressed:bg-pine data-pressed:text-sage-50 data-pressed:[box-shadow:var(--shadow-primary)] data-pressed:hover:bg-pine/90',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        segmented: 'bg-transparent',
        outline:
          'border border-border bg-transparent [box-shadow:var(--shadow-s)] hover:[box-shadow:var(--shadow-m)] data-pressed:border-pine',
      },
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2',
        lg: 'h-10 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Toggle({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
