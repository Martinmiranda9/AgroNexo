import { describe, expect, it } from 'vitest';
import { AUTH_CONTINUE_PATH, safeReturnTo } from '@/core/auth/config';
import { passwordStrengthError } from '@/core/auth/password-rules';

// El paso "Tu cuenta" (`AccountStep.tsx`) ya no arma su UI con `StepFields`/`ACCOUNT_STEP.fields` (que
// quedó vacío a propósito): Google y correo se autentican contra la pantalla hosteada de Auth0 en un
// popup, no con un formulario propio de contraseña — Auth0 bloquea el intercambio directo de
// credenciales (grant Password) para tenants nuevos. Ver `core/auth/google-sign-in.ts`.

describe('passwordStrengthError', () => {
  it('devuelve undefined para una contraseña válida', () => {
    expect(passwordStrengthError('Secreta123')).toBeUndefined();
  });

  it('rechaza contraseñas débiles', () => {
    expect(passwordStrengthError('corta1A')).toBeDefined();
    expect(passwordStrengthError('todominuscula1')).toBeDefined();
  });
});

describe('safeReturnTo', () => {
  it('deja pasar solo rutas internas', () => {
    expect(safeReturnTo(AUTH_CONTINUE_PATH)).toBe(AUTH_CONTINUE_PATH);
    expect(safeReturnTo('/onboarding?type=producer')).toBe('/onboarding?type=producer');
  });

  it('descarta redirecciones abiertas', () => {
    expect(safeReturnTo('//evil.com')).toBeUndefined();
    expect(safeReturnTo('https://evil.com')).toBeUndefined();
    expect(safeReturnTo('/\\evil.com')).toBeUndefined();
    expect(safeReturnTo(null)).toBeUndefined();
  });
});
