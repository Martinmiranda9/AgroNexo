'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere Badge (registro `cashmere/badge`): chip redondeado con tinte suave y texto profundo. AgroNexo conserva
 * sus variantes: los estados van siempre como pill clara (verde/naranja/rojo con texto -ink); `primary` es el
 * único relleno de marca e `inverse` va sobre pine.
 */
const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center gap-1 overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        outline: 'bg-transparent text-foreground ring-1 ring-inset ring-border',
        success: 'bg-pop-green text-pop-green-foreground',
        warning: 'bg-pop-yellow text-pop-yellow-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        ghost: 'bg-transparent text-muted-foreground hover:bg-muted',
        link: 'text-foreground underline-offset-4 hover:underline',
        /** AgroNexo: sobre fondos pine. */
        inverse: 'bg-sage-50/10 text-sage-50 ring-1 ring-sage-50/25 backdrop-blur-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

/** Punto de estado de los tags (ss-components badge-16/17/18). Toma el color del texto de la variante. */
function BadgeDot({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge-dot"
      aria-hidden="true"
      className={cn('size-1.5 shrink-0 rounded-full bg-current', className)}
      {...props}
    />
  );
}

export { Badge, BadgeDot, badgeVariants };
