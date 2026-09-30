/** Reglas propias de UX; Firebase solo exige 6 caracteres como mínimo, esto es más estricto a propósito. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_REQUIREMENTS_HINT = 'Mínimo 8 caracteres, con mayúscula, minúscula y número.';

/** Mensaje de error si la contraseña no cumple las reglas, o `undefined` si es válida. */
export function passwordStrengthError(password: string): string | undefined {
  if (password.length < PASSWORD_MIN_LENGTH) return `Usá al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (password.length > PASSWORD_MAX_LENGTH) return `Usá como máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Incluí una mayúscula, una minúscula y un número.';
  }
  return undefined;
}
