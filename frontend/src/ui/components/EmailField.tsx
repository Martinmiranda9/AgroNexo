'use client';

import { InlineValidation, type InlineValidationProps } from './InlineValidation';

/** Correo con forma razonable: algo@dominio.ext. La validación definitiva la hace Firebase o el backend. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mensajes del campo de correo, los mismos en toda la app. */
export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Ingresá tu correo.';
  return EMAIL_PATTERN.test(email) ? null : 'Ingresá un correo válido.';
}

type EmailFieldProps = Omit<
  InlineValidationProps,
  'type' | 'validate' | 'label' | 'inputMode' | 'autoComplete'
> & {
  label?: string;
  autoComplete?: string;
};

/**
 * Campo de correo de AgroNexo: el InlineValidation de Cashmere con el tipo, el teclado, el autocompletado y los
 * mensajes de correo ya puestos. Se usa en todos los formularios que piden un correo.
 */
export default function EmailField({
  label = 'Correo',
  placeholder = 'tu@correo.com',
  autoComplete = 'email',
  ...props
}: EmailFieldProps) {
  return (
    <InlineValidation
      type="email"
      inputMode="email"
      label={label}
      placeholder={placeholder}
      autoComplete={autoComplete}
      validate={validateEmail}
      {...props}
    />
  );
}
