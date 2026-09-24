import { NextResponse } from 'next/server';
import { isAuth0Configured, AUTH_CONTINUE_PATH } from '@/core/auth/config';
import { loginWithPassword, signupWithPassword } from '@/core/auth/auth0-password';
import { clientIpFrom, credentialsSchema } from '@/core/auth/credentials';
import { writePasswordSession } from '@/core/auth/password-session';

/** Crea la cuenta en Auth0 y deja la sesión iniciada; el registro de perfil sigue en /onboarding. */
export async function POST(req: Request) {
  if (!isAuth0Configured()) {
    return NextResponse.json({ message: 'El acceso todavía no está configurado en este entorno.' }, { status: 503 });
  }

  const parsed = credentialsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 });
  }

  const signup = await signupWithPassword(parsed.data.email, parsed.data.password);
  if (!signup.ok) return NextResponse.json({ message: signup.message }, { status: signup.status });

  const login = await loginWithPassword(parsed.data.email, parsed.data.password, clientIpFrom(req));
  if (!login.ok) return NextResponse.json({ message: login.message }, { status: login.status });

  await writePasswordSession(login.data.session, login.data.expiresIn);
  return NextResponse.json({ next: AUTH_CONTINUE_PATH });
}
