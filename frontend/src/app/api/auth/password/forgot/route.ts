import { NextResponse } from 'next/server';
import { isAuth0Configured } from '@/core/auth/config';
import { requestPasswordReset } from '@/core/auth/auth0-password';
import { emailSchema } from '@/core/auth/credentials';

export async function POST(req: Request) {
  if (!isAuth0Configured()) {
    return NextResponse.json({ message: 'El acceso todavía no está configurado en este entorno.' }, { status: 503 });
  }

  const parsed = emailSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Ingresá un correo válido.' }, { status: 400 });
  }

  await requestPasswordReset(parsed.data.email);
  // Misma respuesta exista o no el correo.
  return NextResponse.json({ ok: true });
}
