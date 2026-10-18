'use client';

import { useId } from 'react';
import { CheckboxCard } from './Checkbox';
import { FieldDescription, FieldError, FieldLegend, FieldSet } from './Field';
import { RadioCard, RadioGroup } from './RadioGroup';

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
  /** Selección múltiple: checkboxes en card en lugar de radios. */
  multiple?: boolean;
  hint?: string;
  error?: string;
}

/**
 * Pregunta de opciones del formulario armada con componentes de Cashmere: opción única con `RadioGroup` +
 * `RadioCard` y múltiple con `CheckboxCard` (las "Checkbox Cards" de Cashmere). Activo = pine.
 */
export default function ChoiceGroup({
  label,
  options,
  value,
  onValueChange,
  multiple,
  hint,
  error,
}: ChoiceGroupProps) {
  const id = useId();
  const legendId = `${id}-legend`;
  const messageId = `${id}-message`;
  const describedBy = error || hint ? messageId : undefined;

  return (
    <FieldSet aria-describedby={describedBy} data-invalid={error ? true : undefined}>
      {label && (
        <FieldLegend id={legendId} variant="label">
          {label}
        </FieldLegend>
      )}

      {multiple ? (
        <div
          role="group"
          aria-labelledby={label ? legendId : undefined}
          className="flex flex-wrap gap-2"
        >
          {options.map((o) => (
            <CheckboxCard
              key={o.value}
              title={o.label}
              description={o.description}
              checked={value.includes(o.value)}
              onCheckedChange={(checked) =>
                onValueChange(checked ? [...value, o.value] : value.filter((v) => v !== o.value))
              }
            />
          ))}
        </div>
      ) : (
        <RadioGroup
          aria-labelledby={label ? legendId : undefined}
          value={value[0] ?? null}
          onValueChange={(next) => onValueChange([next as string])}
        >
          {options.map((o) => (
            <RadioCard key={o.value} value={o.value} title={o.label} description={o.description} />
          ))}
        </RadioGroup>
      )}

      {error ? (
        <FieldError id={messageId}>{error}</FieldError>
      ) : (
        hint && <FieldDescription id={messageId}>{hint}</FieldDescription>
      )}
    </FieldSet>
  );
}
