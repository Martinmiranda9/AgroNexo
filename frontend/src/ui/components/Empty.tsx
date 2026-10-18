// Cashmere Empty (registro `cashmere/empty`) con la API de subcomponentes que ya usaba la app
// (EmptyMedia = EmptyIcon, EmptyContent = EmptyActions).
import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-balance',
        className
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn('flex max-w-md flex-col items-center gap-3', className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [box-shadow:var(--shadow-s)] [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-foreground text-base font-semibold', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-foreground max-w-md text-sm leading-relaxed [&>a]:underline [&>a]:underline-offset-4',
        className
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn('flex flex-wrap items-center justify-center gap-2 pt-1 text-sm', className)}
      {...props}
    />
  );
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia };
