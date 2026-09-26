import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Iniciales a mostrar (1–2 letras). */
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  /** `solid`: relleno Pine + texto Beige (activo). `tint`: tinte suave. */
  tone?: 'solid' | 'tint';
}

const SIZES = {
  sm: 'h-8 w-8 text-caption',
  md: 'h-10 w-10 text-body-sm',
  lg: 'h-12 w-12 text-body',
} as const;

const TONES = {
  solid: 'bg-pine text-beige',
  tint: 'bg-beige-dark text-primary',
} as const;

/** Avatar circular con iniciales, tamaños fijos. */
export default function Avatar({ initials, size = 'md', tone = 'solid', className, ...props }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-heading',
        SIZES[size],
        TONES[tone],
        className,
      )}
      {...props}
    >
      {initials}
    </span>
  );
}
