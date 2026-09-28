import { NextResponse } from 'next/server';
import { getBackendToken } from '@/core/auth/server';
import { forwardRegistration } from '@/core/auth/backend';

/**
 * Registro de perfil para quien ya tiene sesión (Google, o correo que quedó a medias).
 * El token vive en una cookie httpOnly: el navegador nunca lo ve.
 */
export async function POST(req: Request) {
  const token = await getBackendToken();
  if (!token) {
    return NextResponse.json(
      { status: 401, title: 'No autorizado', detail: 'Tu sesión expiró. Volvé a iniciar sesión.' },
      { status: 401 },
    );
  }

  return forwardRegistration(token, await req.text());
}
