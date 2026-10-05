import { passwordStrengthError } from '@/core/auth/password-rules';
import type { FieldDef, FormValues, StepDef } from '../config/types';

export type FieldErrors = Record<string, string>;

const DOCUMENT_PATTERN = /^[0-9A-Za-z.\-/\s]{7,50}$/;
const PHONE_PATTERN = /^\+[1-9][0-9]{7,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Quita espacios, guiones y paréntesis: "+54 9 351-123 4567" → "+5493511234567". */
export const normalizePhone = (value: string) => value.replace(/[\s\-()]/g, '');

function validateField(field: FieldDef, values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (field.kind === 'location') {
    if (field.required && !values.country) errors.country = 'Elegí un país.';
    if (field.required && field.levels.includes('province') && !values.province) errors.province = 'Elegí una provincia.';
    return errors;
  }

  if (field.kind === 'password') {
    // Sin trim: los espacios de una contraseña cuentan.
    const password = values[field.name] ?? '';
    if (!password) errors[field.name] = 'Este campo es obligatorio.';
    else if (field.confirms) {
      if (password !== (values[field.confirms] ?? '')) errors[field.name] = 'Las contraseñas no coinciden.';
    } else {
      const message = passwordStrengthError(password);
      if (message) errors[field.name] = message;
    }
    return errors;
  }

  if (field.kind === 'email' && field.readOnly) return errors;

  const value = (values[field.name] ?? '').trim();

  if (!value) {
    if (field.required) errors[field.name] = field.kind === 'choice' ? (field.multiple ? 'Elegí al menos una opción.' : 'Elegí una opción.') : 'Este campo es obligatorio.';
    return errors;
  }

  if (field.kind === 'number' || field.kind === 'counter') {
    const n = Number(value);
    if (!Number.isInteger(n)) errors[field.name] = 'Ingresá un número entero.';
    else if (field.min !== undefined && n < field.min) errors[field.name] = `El mínimo es ${field.min}.`;
    else if (field.max !== undefined && n > field.max) errors[field.name] = `El máximo es ${field.max}.`;
    return errors;
  }

  if (field.kind === 'email') {
    if (!EMAIL_PATTERN.test(value)) errors[field.name] = 'Ingresá un correo válido.';
    else if (value.length > 254) errors[field.name] = 'El correo es demasiado largo.';
    return errors;
  }

  if (field.kind === 'text') {
    if (field.format === 'document' && !DOCUMENT_PATTERN.test(value)) errors[field.name] = 'Ingresá un DNI o CUIT válido.';
    else if (field.format === 'phone' && !PHONE_PATTERN.test(normalizePhone(value)))
      errors[field.name] = 'Ingresá tu WhatsApp con código de país, ej: +54 9 351 123 4567.';
    else if (!field.format && value.length < 2) errors[field.name] = 'Escribí al menos 2 caracteres.';
  }

  return errors;
}

export function validateStep(step: StepDef, values: FormValues): FieldErrors {
  return step.fields.reduce<FieldErrors>((acc, f) => ({ ...acc, ...validateField(f, values) }), {});
}
