'use client';

import { memo, useId } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import { PasswordInput } from '@/ui/components/PasswordInput';
import type { PasswordField as PasswordFieldDef } from '../config/types';

interface PasswordFieldProps {
  field: PasswordFieldDef;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/**
 * Campo de contraseña con mostrar/ocultar (PasswordInput de Cashmere). Cada instancia recuerda su visibilidad.
 * Memorizado: en un formulario con varios campos, tipear en otro no lo vuelve a renderizar.
 */
function PasswordField({ field, value, error, onChange }: PasswordFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <PasswordInput
        id={id}
        placeholder={field.placeholder}
        autoComplete={field.autoComplete}
        maxLength={128}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : field.hint ? hintId : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <FieldError id={errorId}>{error}</FieldError>
      {field.hint && !error && <FieldDescription id={hintId}>{field.hint}</FieldDescription>}
    </Field>
  );
}

export default memo(PasswordField);
