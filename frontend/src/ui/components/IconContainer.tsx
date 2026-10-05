import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface IconContainerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md';
  /** `tint`: fondo suave con icono Oliva. `solid`: relleno Pine + icono Beige (activo). */
  tone?: 'tint' | 'solid';
}

const SIZES = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
} as const;

const TONES = {
  tint: 'bg-beige-dark text-olive',
  solid: 'bg-pine text-beige',
} as const;

/** Contenedor circular para iconos (Phosphor), tamaños fijos. */
export default function IconContainer({ size = 'md', tone = 'tint', className, children, ...props }: IconContainerProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full', SIZES[size], TONES[tone], className)}
      {...props}
    >
      {children}
    </span>
  );
}
