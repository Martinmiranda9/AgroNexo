import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAuth0Configured } from '@/core/auth/config';
import { loginWithPassword, signupWithPassword } from '@/core/auth/auth0-password';
import { forwardRegistration } from '@/core/auth/backend';
import { clientIpFrom, credentialsSchema } from '@/core/auth/credentials';
import { PASSWORD_MAX_LENGTH, passwordStrengthError } from '@/core/auth/password-rules';
import { writePasswordSession } from '@/core/auth/password-session';

const registerSchema = z.object({
  email: credentialsSchema.shape.email,
  password: z
    .string()
    .max(PASSWORD_MAX_LENGTH)
    .superRefine((value, ctx) => {
      const message = passwordStrengthError(value);
      if (message) ctx.addIssue({ code: 'custom', message });
    }),
  // El perfil lo valida el backend (fuente de verdad de sus reglas); acá solo se reenvía.
  profile: z.record(z.unknown()),
});

/** `code` le dice al wizard a qué campo del paso "Tu cuenta" volver (ver `useRegistrationWizard`). */
type ProblemCode = 'email_exists' | 'invalid_email' | 'weak_password';

const problem = (status: number, detail: string, code?: ProblemCode) =>
  NextResponse.json({ status, title: 'No se pudo completar el registro', detail, code }, { status });

/**
 * Registro completo con correo y contraseña, en un solo paso desde el último paso del wizard:
 * crea el usuario en Auth0 → inicia sesión → registra el perfil en el backend.
 * Recién acá nace la cuenta de Auth0, así abandonar el formulario antes no deja usuarios huérfanos.
 */
export async function POST(req: Request) {
  if (!isAuth0Configured()) return problem(503, 'El acceso todavía no está configurado en este entorno.');

  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const code = issue?.path[0] === 'email' ? 'invalid_email' : issue?.path[0] === 'password' ? 'weak_password' : undefined;
    return problem(400, issue?.message ?? 'Datos inválidos.', code);
  }
  const { email, password, profile } = parsed.data;
  const ip = clientIpFrom(req);

  const signup = await signupWithPassword(email, password);
  // Reintento tras un fallo del backend: la cuenta ya existe, pero si la contraseña coincide se continúa
  // con el perfil. Con otra contraseña, el login de abajo falla y se informa que el correo ya está en uso.
  if (!signup.ok && signup.status !== 409) {
    return problem(signup.status, signup.message, signup.status === 400 ? 'weak_password' : undefined);
  }

  const login = await loginWithPassword(email, password, ip);
  if (!login.ok) {
    return signup.ok ? problem(login.status, login.message) : problem(409, signup.message, 'email_exists');
  }

  await writePasswordSession(login.data.session, login.data.expiresIn);
  // Si el backend falla, la sesión queda iniciada: el wizard reintenta con el registro "con sesión".
  return forwardRegistration(login.data.session.accessToken, JSON.stringify(profile));
}
