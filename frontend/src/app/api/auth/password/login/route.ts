import { NextResponse } from 'next/server';
import { isAuth0Configured, AUTH_CONTINUE_PATH } from '@/core/auth/config';
import { loginWithPassword } from '@/core/auth/auth0-password';
import { clientIpFrom, credentialsSchema } from '@/core/auth/credentials';
import { writePasswordSession } from '@/core/auth/password-session';

export async function POST(req: Request) {
  if (!isAuth0Configured()) {
    return NextResponse.json({ message: 'El acceso todavía no está configurado en este entorno.' }, { status: 503 });
  }

  const parsed = credentialsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 });
  }

  const result = await loginWithPassword(parsed.data.email, parsed.data.password, clientIpFrom(req));
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });

  await writePasswordSession(result.data.session, result.data.expiresIn);
  return NextResponse.json({ next: AUTH_CONTINUE_PATH });
}
