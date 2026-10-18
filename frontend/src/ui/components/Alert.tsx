import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere Alert (registro `cashmere/alert-base`): card con borde teñido según el estado y el ícono a la
 * izquierda. Los estados usan los tokens de AgroNexo (success/warning/destructive) en vez de oklch sueltos.
 * Se conserva `AlertAction` (botón arriba a la derecha) que ya usaba la app.
 */
const alertVariants = cva(
  "group/alert relative w-full rounded-xl border p-4 text-left text-sm [box-shadow:var(--shadow-s)] has-data-[slot=alert-action]:pr-18 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg~*]:pl-7 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        info: 'bg-card text-card-foreground border-primary/40 [&>svg]:text-primary',
        success: 'bg-card text-card-foreground border-success/40 [&>svg]:text-success',
        warning: 'bg-card text-card-foreground border-warning/40 [&>svg]:text-warning',
        destructive: 'bg-card text-card-foreground border-destructive/40 [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'mb-1 leading-snug font-semibold tracking-tight [&_a]:underline [&_a]:underline-offset-3',
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground [&_a]:hover:text-foreground text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
        className
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-action" className={cn('absolute top-3 right-3', className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
