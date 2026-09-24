import { NextResponse } from 'next/server';
import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';

/**
 * Reenvía el registro al backend con el access token de la sesión de Auth0.
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

  try {
    const upstream = await fetch(`${API_ORIGIN}/api/v1/identity/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: await req.text(),
      cache: 'no-store',
    });

    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { status: 502, title: 'Servicio no disponible', detail: 'No pudimos conectarnos con el servidor.' },
      { status: 502 },
    );
  }
}
