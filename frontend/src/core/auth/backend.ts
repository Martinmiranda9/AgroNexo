import { NextResponse } from 'next/server';
import { API_ORIGIN } from '@/core/config/api';

/** Reenvía el registro de perfil al backend con el access token de la sesión y devuelve su respuesta tal cual. */
export async function forwardRegistration(token: string, body: string): Promise<NextResponse> {
  try {
    const upstream = await fetch(`${API_ORIGIN}/api/v1/identity/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body,
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
