import { NextResponse } from 'next/server';
import { isAuth0Configured } from '@/core/auth/config';
import { fetchEmailVerified, resendVerificationEmail } from '@/core/auth/auth0-management';
import { getSessionUser } from '@/core/auth/server';

/**
 * Verificación de correo de la sesión actual (solo usuarios de correo y contraseña; Google ya viene verificado).
 *  GET  → `{ emailVerified }` con el estado real en Auth0.
 *  POST → reenvía el mail de verificación.
 */
async function currentUserId(): Promise<string | undefined> {
  if (!isAuth0Configured()) return undefined;
  return (await getSessionUser())?.id || undefined;
}

const unauthorized = () => NextResponse.json({ message: 'Iniciá sesión para continuar.' }, { status: 401 });

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return unauthorized();

  const result = await fetchEmailVerified(userId);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json(result.data);
}

export async function POST() {
  const userId = await currentUserId();
  if (!userId) return unauthorized();

  // Nada que reenviar a quien ya está verificado (los de Google entran siempre así).
  const status = await fetchEmailVerified(userId);
  if (status.ok && status.data.emailVerified) return NextResponse.json({ emailVerified: true });

  const result = await resendVerificationEmail(userId);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ emailVerified: false, sent: true });
}
