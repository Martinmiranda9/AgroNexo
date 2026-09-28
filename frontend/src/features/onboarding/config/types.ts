export type RegistrationKind = 'producer' | 'agronomist' | 'accountant' | 'lawyer' | 'investor';

/** Valores del formulario: todo string; se convierte al armar el request. */
export type FormValues = Record<string, string>;

/** Credenciales que se piden en el paso "Tu cuenta". No van al backend: solo a Auth0 vía `/api/auth/password/register`. */
export type AccountCredentials = {
  email: string;
  password: string;
  passwordConfirm: string;
};

/** Cuenta ya autenticada (Google o email) con la que se completa el registro. */
export interface RegistrationAccount {
  email?: string;
  firstName?: string;
  lastName?: string;
  /** `google-oauth2` si entró con Google. */
  provider: string;
}

export type PreviewIcon = 'map' | 'briefcase' | 'clock' | 'users' | 'leaf' | 'compass' | 'phone' | 'badge' | 'search';

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

interface BaseField {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
}

export interface TextField extends BaseField {
  kind: 'text' | 'number';
  /** Reglas de validación y normalización específicas. */
  format?: 'phone' | 'document';
  inputMode?: 'text' | 'tel' | 'numeric';
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  autoComplete?: string;
}

/** Correo. `readOnly` cuando viene de una cuenta ya verificada (Google): se muestra pero no se edita. */
export interface EmailField extends BaseField {
  kind: 'email';
  placeholder?: string;
  readOnly?: boolean;
  autoComplete?: string;
}

/** Contraseña con mostrar/ocultar. Con `confirms` es el campo "repetir": debe coincidir con el campo indicado. */
export interface PasswordField extends BaseField {
  kind: 'password';
  placeholder?: string;
  confirms?: string;
  autoComplete?: 'new-password';
}

export interface SelectField extends BaseField {
  kind: 'select';
  placeholder?: string;
  options: FieldOption[];
}

/** Opción única (cards) o múltiple (chips). En modo múltiple el valor se guarda separado por comas. */
export interface ChoiceField extends BaseField {
  kind: 'choice';
  multiple?: boolean;
  options: FieldOption[];
}

/** Cascada país → provincia → ciudad. Guarda country/countryCode/province/provinceCode/city. */
export interface LocationField {
  kind: 'location';
  levels: ('country' | 'province' | 'city')[];
  required?: boolean;
}

export type FieldDef = TextField | EmailField | PasswordField | SelectField | ChoiceField | LocationField;

/** Línea de información de la card de vista previa; `text` vacío = esqueleto. */
export interface PreviewRow {
  icon: PreviewIcon;
  text?: string;
}

export interface PreviewData {
  name?: string;
  badge: string;
  rows: PreviewRow[];
}

export interface StepDef {
  /** `account` = paso "Tu cuenta"; `role` = elección de rol; el resto son los pasos de datos de cada rol. */
  id: string;
  title: string;
  subtitle: string;
  /** Texto al pie del panel derecho mientras el usuario está en este paso. */
  aside: string;
  fields: FieldDef[];
}

export interface RegistrationFlow {
  kind: RegistrationKind;
  roleLabel: string;
  steps: StepDef[];
  initialValues: FormValues;
  submitLabel: string;
  preview: (values: FormValues, stepIndex: number) => PreviewData;
}
