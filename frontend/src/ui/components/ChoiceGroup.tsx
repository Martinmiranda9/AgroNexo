'use client';

import { Check } from '@phosphor-icons/react';
import { cn } from '@/shared/utils/cn';

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
}

interface ChoiceGroupProps {
  label?: string;
  options: ChoiceOption[];
  /** Valores seleccionados (uno solo si `multiple` es falso). */
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Selección múltiple: se muestran chips en lugar de cards. */
  multiple?: boolean;
  hint?: string;
  error?: string;
}

/** Opción única (cards) o múltiple (chips pill). Activo = Pine + Beige. */
export default function ChoiceGroup({ label, options, value, onValueChange, multiple, hint, error }: ChoiceGroupProps) {
  const toggle = (option: string) => {
    if (!multiple) return onValueChange([option]);
    onValueChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  return (
    <div role={multiple ? 'group' : 'radiogroup'} aria-label={label} className="flex flex-col gap-2">
      {label && <span className="text-body-sm font-medium text-pine">{label}</span>}

      <div className={multiple ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'}>
        {options.map((o) => {
          const active = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={active}
              onClick={() => toggle(o.value)}
              className={cn(
                'border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/15',
                multiple
                  ? 'flex h-10 items-center gap-1.5 rounded-full px-4 text-body-sm font-medium'
                  : 'flex flex-col items-start rounded-xl px-4 py-3',
                active
                  ? 'border-pine bg-pine text-beige'
                  : 'border-neutral-warm/50 bg-beige text-pine hover:border-pine/40',
              )}
            >
              {multiple ? (
                <>
                  {active && <Check size={14} weight="bold" />}
                  {o.label}
                </>
              ) : (
                <>
                  <span className="text-body-sm font-semibold">{o.label}</span>
                  {o.description && (
                    <span className={cn('mt-0.5 text-caption', active ? 'text-beige/70' : 'text-primary')}>{o.description}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {error ? <p className="text-caption text-danger">{error}</p> : hint && <p className="text-caption text-primary">{hint}</p>}
    </div>
  );
}
