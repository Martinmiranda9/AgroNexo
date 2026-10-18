import * as React from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { Spinner } from './Spinner';

/*
 * Cashmere Button (registro `cashmere/button-base`): pill plana, sin gradiente; la profundidad es una hairline y
 * el tacto un press suave (active:scale). Adaptado a AgroNexo:
 * - el primario es verde campo 700 con hover en 800 (`primary-hover`), no al 90 %;
 * - destructive es tinte rojo claro + texto rojo (combinación de la identidad);
 * - suma los tamaños `xs`, `icon-xs`, `icon-sm`, `icon-lg` y la prop `loading` que ya usaba la app.
 */
const buttonVariants = cva(
  [
    'group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'text-sm font-medium leading-none',
    'rounded-full cursor-pointer select-none',
    'transition-[background-color,box-shadow,transform,color] duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground [box-shadow:var(--shadow-xs)] hover:bg-primary-hover',
        primary:
          'bg-primary text-primary-foreground [box-shadow:var(--shadow-xs)] hover:bg-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground [box-shadow:var(--shadow-button)] hover:bg-accent hover:[box-shadow:var(--shadow-button-hover)]',
        outline:
          'bg-transparent text-foreground border border-border hover:bg-accent hover:border-foreground/20 hover:text-accent-foreground',
        ghost: 'bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
        link: 'text-foreground underline-offset-4 hover:underline hover:text-ring',
      },
      size: {
        xs: 'h-7 px-3 text-xs',
        sm: 'h-8 px-4 text-xs',
        default: 'h-10 px-5',
        lg: 'h-12 px-7 text-base',
        icon: 'size-10',
        'icon-xs': 'size-7',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** API de Cashmere/Radix: el hijo único pasa a ser el elemento (se traduce a `render` de Base UI). */
    asChild?: boolean;
    /** AgroNexo: envío en curso. Deshabilita, marca `aria-busy` y pone el spinner al inicio. */
    loading?: boolean;
    /** Texto mientras `loading` ("Enviando…"); sin él, queda el texto original. */
    loadingText?: React.ReactNode;
  };

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  loadingText,
  disabled,
  children,
  render,
  ...props
}: ButtonProps) {
  const slotChild = asChild && React.isValidElement(children) ? children : null;

  return (
    <ButtonPrimitive
      data-slot="button"
      data-size={size}
      // Enviando no es "deshabilitado": sin el 50 % de opacidad, para que la acción en curso se lea firme.
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && 'disabled:opacity-100'
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
      // Con `asChild` el hijo (un Link, un <a>) no es un <button> nativo: Base UI necesita saberlo.
      nativeButton={slotChild ? slotChild.type === 'button' : props.nativeButton}
      render={slotChild ? (slotChild as React.ReactElement) : render}
    >
      {slotChild ? undefined : loading ? (
        <>
          <Spinner data-icon="inline-start" aria-hidden role={undefined} aria-label={undefined} />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
