'use client';

import { useId, useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/ui/components';
import type { PasswordField as PasswordFieldDef } from '../config/types';

interface PasswordFieldProps {
  field: PasswordFieldDef;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/** Campo de contraseña con mostrar/ocultar. Cada instancia recuerda su propia visibilidad. */
export default function PasswordField({ field, value, error, onChange }: PasswordFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [visible, setVisible] = useState(false);

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          maxLength={128}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : field.hint ? hintId : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
            className="text-neutral-warm hover:text-pine"
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeSlash /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldError id={errorId}>{error}</FieldError>
      {field.hint && !error && <FieldDescription id={hintId}>{field.hint}</FieldDescription>}
    </Field>
  );
}
