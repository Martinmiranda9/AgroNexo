import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, safeReturnTo } from '@/core/auth/config';

/**
 * Logout por link simple (`<a href>`, ej. "Cambiar cuenta" en el wizard de registro): borra la cookie
 * de sesión y redirige. El `signOut` del SDK de Firebase en el cliente es aparte (ver `firebaseAuth`);
 * como esta cookie es httpOnly el cliente no puede borrarla por su cuenta, así que esta ruta existe
 * para los enlaces que no pasan por un componente con JS (y como red de resguardo del cliente).
 */
export async function GET(req: NextRequest) {
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get('returnTo')) ?? '/login';
  const res = NextResponse.redirect(new URL(returnTo, req.url));
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
