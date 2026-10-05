'use client';

import { useId } from 'react';
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

/**
 * Opción única (cards) o múltiple (chips pill). Activo = Pine + Beige.
 * Opción única usa radios nativos (flechas, un solo tab-stop y semántica gratis); múltiple, checkboxes nativos.
 */
export default function ChoiceGroup({ label, options, value, onValueChange, multiple, hint, error }: ChoiceGroupProps) {
  const name = useId();
  const messageId = `${name}-message`;

  const toggle = (option: string) => {
    if (!multiple) return onValueChange([option]);
    onValueChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  return (
    <fieldset aria-describedby={error || hint ? messageId : undefined} data-invalid={error ? true : undefined} className="flex min-w-0 flex-col gap-2">
      {label && <legend className="mb-2 text-body-sm font-medium text-pine">{label}</legend>}

      <div className={multiple ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'}>
        {options.map((o) => {
          const active = value.includes(o.value);
          return (
            <label
              key={o.value}
              className={cn(
                'relative cursor-pointer border text-left transition-all duration-200',
                'has-focus-visible:ring-2 has-focus-visible:ring-pine has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg-card',
                multiple
                  ? 'flex h-11 items-center gap-1.5 rounded-full px-4 text-body-sm font-medium'
                  : 'flex flex-col items-start rounded-lg px-4 py-3',
                active
                  ? 'border-pine bg-pine text-beige'
                  : 'border-neutral-warm bg-beige text-pine hover:border-pine',
              )}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={multiple ? undefined : name}
                value={o.value}
                checked={active}
                onChange={() => toggle(o.value)}
                className="sr-only"
              />
              {multiple ? (
                <>
                  {active && <Check size={14} weight="bold" aria-hidden />}
                  {o.label}
                </>
              ) : (
                <>
                  <span className="text-body-sm font-semibold">{o.label}</span>
                  {o.description && (
                    <span className={cn('mt-0.5 text-body-sm', active ? 'text-beige/80' : 'text-olive')}>{o.description}</span>
                  )}
                </>
              )}
            </label>
          );
        })}
      </div>

      {error ? (
        <p id={messageId} role="alert" className="text-body-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-body-sm text-olive">
            {hint}
          </p>
        )
      )}
    </fieldset>
  );
}
