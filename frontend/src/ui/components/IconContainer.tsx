import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface IconContainerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md';
  /** `tint`: fondo salvia con icono gris. `brand`: tinte verde campo. `solid`: relleno pine + icono claro (activo). */
  tone?: 'tint' | 'brand' | 'solid';
}

const SIZES = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
} as const;

const TONES = {
  tint: 'bg-sage-100 text-sage-600',
  brand: 'bg-field-100 text-field-700',
  solid: 'bg-pine text-sage-50',
} as const;

/** Contenedor circular para iconos (Material de react-icons), tamaños fijos. */
export default function IconContainer({
  size = 'md',
  tone = 'tint',
  className,
  children,
  ...props
}: IconContainerProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        SIZES[size],
        TONES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
