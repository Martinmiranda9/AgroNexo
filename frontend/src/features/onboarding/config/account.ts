import { PASSWORD_REQUIREMENTS_HINT } from '@/core/auth/password-rules';
import type { FieldDef, StepDef } from './types';

export const ACCOUNT_STEP_ID = 'account';

/**
 * Primer paso cuando todavía no hay sesión: correo y contraseña (con confirmación). Con Google se
 * omite: nombre, apellido y correo llegan de la cuenta y no se pide contraseña.
 */
export const ACCOUNT_STEP: StepDef = {
  id: ACCOUNT_STEP_ID,
  title: 'Creá tu cuenta',
  subtitle: 'Ingresá con Google y completamos tus datos por vos, o creá tu acceso con correo y contraseña.',
  aside: 'Con tu cuenta armamos tu perfil. Después te pedimos los datos de tu campo o de tu actividad profesional.',
  fields: [
    {
      kind: 'email',
      name: 'email',
      label: 'Correo',
      placeholder: 'tu@correo.com',
      required: true,
      autoComplete: 'email',
    },
    {
      kind: 'password',
      name: 'password',
      label: 'Contraseña',
      placeholder: 'Creá una contraseña',
      required: true,
      autoComplete: 'new-password',
      hint: PASSWORD_REQUIREMENTS_HINT,
    },
    {
      kind: 'password',
      name: 'passwordConfirm',
      label: 'Repetir contraseña',
      placeholder: 'Repetí tu contraseña',
      required: true,
      autoComplete: 'new-password',
      confirms: 'password',
    },
  ],
};

/** Correo solo lectura que se muestra en el paso de datos personales cuando la cuenta ya lo trae (Google). */
export const ACCOUNT_EMAIL_FIELD: FieldDef = {
  kind: 'email',
  name: 'email',
  label: 'Correo',
  readOnly: true,
  autoComplete: 'email',
  hint: 'Es el correo con el que iniciaste sesión.',
};
