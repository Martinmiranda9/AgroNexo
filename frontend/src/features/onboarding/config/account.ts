import type { FieldDef, StepDef } from './types';

export const ACCOUNT_STEP_ID = 'account';

/**
 * Primer paso cuando todavía no hay sesión: Google o correo y contraseña, ambos contra Firebase
 * (`AccountStep.tsx`, que maneja su propio formulario) — por eso `fields` queda vacío, no lo arma
 * `StepFields` como el resto de los pasos.
 */
export const ACCOUNT_STEP: StepDef = {
  id: ACCOUNT_STEP_ID,
  title: 'Creá tu cuenta',
  subtitle: 'Ingresá con Google o con tu correo. Después completamos el resto de tus datos.',
  aside: 'Con tu cuenta armamos tu perfil. Después te pedimos los datos de tu campo o de tu actividad profesional.',
  fields: [],
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
