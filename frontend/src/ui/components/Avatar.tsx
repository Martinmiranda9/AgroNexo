import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { Avatar as AvatarRoot, AvatarFallback } from './AvatarShadcn';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Iniciales a mostrar (1–2 letras). */
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  /** `solid`: relleno Pine + texto Beige (activo). `tint`: tinte suave. */
  tone?: 'solid' | 'tint';
}

const SIZES = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-body-sm',
  lg: 'size-12 text-body',
} as const;

const TONES = {
  solid: 'bg-pine text-beige',
  tint: 'bg-beige-dark text-olive',
} as const;

/**
 * Avatar de iniciales del kit. Es el `Avatar` de shadcn (`AvatarShadcn`) con solo el fallback: un único componente de
 * avatar en la app, con los tamaños y tonos de AgroNexo.
 */
export default function Avatar({
  initials,
  size = 'md',
  tone = 'solid',
  className,
  ...props
}: AvatarProps) {
  return (
    <AvatarRoot className={cn(SIZES[size], 'after:border-transparent', className)} {...props}>
      <AvatarFallback
        className={cn('tracking-heading [font-size:inherit] font-semibold', TONES[tone])}
      >
        {initials}
      </AvatarFallback>
    </AvatarRoot>
  );
}
