/**
 * Recetas compartidas de Cashmere (registro `cashmere/_shared`) para superficies y campos.
 *
 * Adaptadas a AgroNexo: el borde de los campos es `input-border` (sage-400, 3,3:1; parte de la identidad) en vez
 * de `border`, y el texto queda en 16px en celular para que iOS no haga zoom al enfocar (14px desde `md`).
 */

import type { CSSProperties } from 'react';

/* Superficie de card / sheet: plana. La profundidad sale del anillo y la sombra suave (tokens de globals.css). */
export const cashmereSurfaceStyle: CSSProperties = {};

/* Superficie flotante (popover): plana, mismo criterio. */
export const cashmereGrainStyle: CSSProperties = {};

export const formFieldBase =
  'w-full min-w-0 rounded-lg px-3.5 text-base md:text-sm ' +
  'bg-input text-foreground ' +
  'border border-input-border ' +
  'placeholder:text-muted-foreground ' +
  'transition-[color,box-shadow,border-color] duration-150 ' +
  '[box-shadow:var(--shadow-inset)] ' +
  'hover:border-foreground/40 ' +
  'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 ' +
  'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/35 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export const formFieldSingleLine = 'flex h-10 py-2';
export const formFieldMultiLine = 'flex min-h-[84px] py-2.5 resize-y';
