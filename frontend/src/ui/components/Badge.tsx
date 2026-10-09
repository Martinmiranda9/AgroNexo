'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        // Tags de estado (ss-components badge-18 / 16 / 17): positivo, pendiente y negativo.
        // El texto usa el tono -ink (800) para llegar a 4,5:1; el tinte y el punto siguen en el 600.
        success:
          'border-none bg-success/10 text-success-foreground focus-visible:ring-success/20 focus-visible:outline-none dark:focus-visible:ring-success/40 [a]:hover:bg-success/5',
        warning:
          'border-none bg-warning/10 text-warning-foreground focus-visible:ring-warning/20 focus-visible:outline-none dark:focus-visible:ring-warning/40 [a]:hover:bg-warning/5',
        destructive:
          'border-none bg-destructive/10 text-destructive focus-visible:ring-destructive/20 focus-visible:outline-none dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/5',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
        /** AgroNexo: sobre fondos Pine / gradiente. */
        inverse: 'bg-beige/10 text-beige ring-1 ring-beige/25 backdrop-blur-md',
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
