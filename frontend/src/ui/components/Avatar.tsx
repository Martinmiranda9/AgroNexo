'use client';

import * as React from 'react';
import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere Avatar (registros `cashmere/avatar-base` y `cashmere/avatar-group`): círculo con sombra suave, imagen
 * o iniciales. AgroNexo suma `size`, `AvatarBadge` (punto de estado) e `InitialsAvatar` (iniciales en pine o en
 * tinte), que son los usos de la app.
 */

const AVATAR_SIZES = {
  sm: 'size-8 text-xs',
  default: 'size-10 text-sm',
  lg: 'size-12 text-base',
} as const;

function Avatar({
  className,
  size = 'default',
  ...props
}: AvatarPrimitive.Root.Props & { size?: keyof typeof AVATAR_SIZES }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar relative flex shrink-0 rounded-full [box-shadow:var(--shadow-s)] select-none',
        AVATAR_SIZES[size],
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full rounded-full object-cover', className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full font-medium',
        className
      )}
      {...props}
    />
  );
}

/** Punto de estado abajo a la derecha del avatar (por ejemplo, "en línea"). */
function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'bg-primary ring-card absolute right-0 bottom-0 z-10 inline-flex size-2.5 items-center justify-center rounded-full ring-2 select-none',
        className
      )}
      {...props}
    />
  );
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  total?: number;
}

function AvatarGroup({ className, children, max, total, ...props }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visible = max ? childArray.slice(0, max) : childArray;
  const hiddenCount = (total ?? childArray.length) - visible.length;

  return (
    <div
      data-slot="avatar-group"
      className={cn('flex items-center -space-x-2', className)}
      {...props}
    >
      {visible.map((child, i) => (
        <div key={i} className="ring-card rounded-full ring-2">
          {child}
        </div>
      ))}
      {hiddenCount > 0 && (
        <div className="bg-muted text-muted-foreground ring-card relative flex size-10 items-center justify-center rounded-full text-xs font-medium ring-2 [box-shadow:var(--shadow-s)]">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}

const INITIALS_SIZES = { sm: 'sm', md: 'default', lg: 'lg' } as const;

const INITIALS_TONES = {
  /** Relleno pine + texto beige (lo activo / la persona protagonista). */
  solid: 'bg-pine text-sage-50',
  /** Tinte suave para listas y equipos. */
  tint: 'bg-muted text-muted-foreground',
} as const;

export interface InitialsAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Iniciales a mostrar (1–2 letras). */
  initials: string;
  size?: keyof typeof INITIALS_SIZES;
  tone?: keyof typeof INITIALS_TONES;
}

/** Avatar de iniciales: el Avatar de Cashmere con solo el fallback, en los tonos de AgroNexo. */
function InitialsAvatar({
  initials,
  size = 'md',
  tone = 'solid',
  className,
  ...props
}: InitialsAvatarProps) {
  return (
    <Avatar size={INITIALS_SIZES[size]} className={className} {...props}>
      <AvatarFallback className={cn('font-semibold', INITIALS_TONES[tone])}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, InitialsAvatar };
