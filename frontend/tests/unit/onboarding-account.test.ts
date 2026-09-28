import { describe, expect, it } from 'vitest';
import { ACCOUNT_STEP } from '@/features/onboarding/config/account';
import { validateStep } from '@/features/onboarding/lib/validation';
import { AUTH_CONTINUE_PATH, safeReturnTo } from '@/core/auth/config';
import { passwordStrengthError } from '@/core/auth/password-rules';

const valid = { email: 'ana@correo.com', password: 'Secreta123', passwordConfirm: 'Secreta123' };

describe('paso "Tu cuenta"', () => {
  it('acepta correo válido y contraseñas iguales y fuertes', () => {
    expect(validateStep(ACCOUNT_STEP, valid)).toEqual({});
  });

  it('exige correo con formato válido', () => {
    expect(validateStep(ACCOUNT_STEP, { ...valid, email: 'ana@correo' }).email).toBe('Ingresá un correo válido.');
    expect(validateStep(ACCOUNT_STEP, { ...valid, email: '' }).email).toBeDefined();
  });

  it('marca la confirmación cuando no coincide', () => {
    const errors = validateStep(ACCOUNT_STEP, { ...valid, passwordConfirm: 'Secreta124' });
    expect(errors.passwordConfirm).toBe('Las contraseñas no coinciden.');
    expect(errors.password).toBeUndefined();
  });

  it('rechaza contraseñas débiles y no recorta espacios', () => {
    expect(validateStep(ACCOUNT_STEP, { ...valid, password: 'corta1A', passwordConfirm: 'corta1A' }).password).toBeDefined();
    expect(validateStep(ACCOUNT_STEP, { ...valid, password: 'todominuscula1', passwordConfirm: 'todominuscula1' }).password).toBeDefined();
    // 8 espacios no son una contraseña
    expect(validateStep(ACCOUNT_STEP, { ...valid, password: '        ', passwordConfirm: '        ' }).password).toBeDefined();
  });

  it('pide la confirmación aunque la contraseña esté bien', () => {
    expect(validateStep(ACCOUNT_STEP, { ...valid, passwordConfirm: '' }).passwordConfirm).toBeDefined();
  });
});

describe('passwordStrengthError', () => {
  it('devuelve undefined para una contraseña válida', () => {
    expect(passwordStrengthError('Secreta123')).toBeUndefined();
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
