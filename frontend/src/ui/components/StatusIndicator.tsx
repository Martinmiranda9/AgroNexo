import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere StatusIndicator (registro `cashmere/status-indicator`): punto + texto, con pulso opcional.
 * AgroNexo: los colores del punto salen de los tokens de estado (verde positivo, naranja pendiente, rojo negativo) en
 * vez de oklch sueltos; el texto lleva el significado, el color es la segunda señal.
 */

const dotVariants = cva('h-2 w-2 rounded-full shrink-0 [box-shadow:var(--shadow-s)]', {
  variants: {
    status: {
      online: 'bg-success',
      offline: 'bg-muted-foreground/60',
      busy: 'bg-destructive',
      away: 'bg-warning',
      idle: 'bg-muted-foreground/40',
    },
  },
  defaultVariants: {
    status: 'online',
  },
});

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof dotVariants> {
  label?: React.ReactNode;
  pulse?: boolean;
}

const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ className, status, label, pulse, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('text-muted-foreground inline-flex items-center gap-2 text-xs', className)}
      {...props}
    >
      <span className="relative inline-flex">
        <span className={cn(dotVariants({ status }))} />
        {pulse && (
          <span
            className={cn(
              'absolute inset-0 animate-ping rounded-full',
              dotVariants({ status }),
              'opacity-60 [box-shadow:none]'
            )}
          />
        )}
      </span>
      {label && <span className="text-foreground font-medium">{label}</span>}
    </span>
  )
);
StatusIndicator.displayName = 'StatusIndicator';

export { StatusIndicator };
