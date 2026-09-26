import * as React from 'react';
import { cn } from '@/shared/utils/cn';

interface OptionCardProps {
  /** Nombre del grupo de radios al que pertenece. */
  name: string;
  value: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  checked: boolean;
  onSelect: (value: string) => void;
  /**
   * `auto`: icono a la izquierda en contenedores angostos y apilado arriba en anchos (container query `@md`).
   * `inline`: siempre icono a la izquierda.
   */
  layout?: 'auto' | 'inline';
  className?: string;
}

/**
 * Card seleccionable de opción única. Usa un radio nativo (oculto) para heredar
 * teclado, foco y semántica; el estado visual sale de `:has(:checked)`.
 * Activo = borde Pine + tinte Beige + icono Pine/Beige + radio relleno.
 * Requiere un ancestro `@container` para el modo `auto`.
 */
export default function OptionCard({
  name,
  value,
  title,
  description,
  icon,
  checked,
  onSelect,
  layout = 'auto',
  className,
}: OptionCardProps) {
  return (
    <label
      className={cn(
        'group relative flex h-full cursor-pointer gap-3.5 rounded-2xl border border-pine/12 p-4 pr-11 transition-[border-color,background-color] duration-200',
        'hover:border-pine/30 hover:bg-beige/60',
        'has-checked:border-pine has-checked:bg-beige has-checked:ring-1 has-checked:ring-pine',
        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-pine/40',
        layout === 'auto' && '@md:flex-col @md:gap-4 @md:p-4 @md:pr-4',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="sr-only"
      />

      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beige-dark text-primary transition-colors duration-200 group-has-checked:bg-pine group-has-checked:text-beige"
      >
        {icon}
      </span>

      <span className="flex min-w-0 flex-col">
        <span className="text-body-sm font-semibold tracking-heading text-pine">{title}</span>
        {description && <span className="mt-1.5 text-caption text-primary">{description}</span>}
      </span>

      <span
        aria-hidden
        className={cn(
          'absolute right-4 top-4 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-neutral-warm/60 transition-colors duration-200 group-has-checked:border-pine',
          layout === 'auto' && '@md:right-4 @md:top-4',
        )}
      >
        <span className="h-2 w-2 scale-0 rounded-full bg-pine transition-transform duration-200 group-has-checked:scale-100" />
      </span>
    </label>
  );
}
