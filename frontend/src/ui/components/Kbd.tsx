// Cashmere Kbd (registro `cashmere/kbd`).
import type * as React from 'react';
import { cn } from '@/shared/utils/cn';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-card border-border text-muted-foreground pointer-events-none inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-md border px-1.5 font-mono text-[0.625rem] font-medium [box-shadow:var(--shadow-s)] select-none [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
