import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { cashmereSurfaceStyle } from './_shared';

/*
 * Cashmere Card (registro `cashmere/card-base`): panel blanco sobre el lienzo, plano, con anillo hairline y una
 * sombra muy suave (--shadow-s) y radio generoso. Las cards interactivas suben un poco en hover.
 * AgroNexo suma `CardAction` (acción o badge arriba a la derecha del encabezado), que el registro no trae.
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, style, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      style={{ ...cashmereSurfaceStyle, ...style }}
      className={cn(
        'bg-card text-card-foreground rounded-2xl',
        '[box-shadow:var(--shadow-s)]',
        'transition-[box-shadow,transform] duration-200',
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-l)]',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        'flex flex-col gap-1.5 p-5',
        'has-data-[slot=card-action]:grid has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-action]:items-start',
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-title"
      className={cn('text-foreground text-base leading-snug font-semibold', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

/** AgroNexo: acción del encabezado. Ocupa la columna derecha a la altura del título y la descripción. */
const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
);
CardAction.displayName = 'CardAction';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-content" className={cn('px-5 pb-5', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn('flex items-center gap-2 px-5 pb-5', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter };
