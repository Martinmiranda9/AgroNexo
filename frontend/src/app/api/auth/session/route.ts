import { NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/core/auth/firebase-verify';
import { SESSION_COOKIE } from '@/core/auth/config';

/**
 * Guarda el ID token de Firebase en una cookie httpOnly tras verificarlo (evita que un valor cualquiera
 * termine en la cookie). El mismo token es lo que el resto de la app manda como Bearer al backend .NET
 * — ahí lo valida de nuevo contra Firebase, así que esto no reemplaza esa validación, solo evita que
 * JavaScript de la página pueda leer o robar el token.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const idToken = typeof body?.idToken === 'string' ? body.idToken : undefined;
  if (!idToken) return NextResponse.json({ message: 'Falta el token.' }, { status: 400 });

  const payload = await verifyFirebaseIdToken(idToken);
  if (!payload) return NextResponse.json({ message: 'Token inválido.' }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  // Los ID tokens de Firebase duran 1 hora; la cookie no dura más que eso.
  res.cookies.set(SESSION_COOKIE, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
