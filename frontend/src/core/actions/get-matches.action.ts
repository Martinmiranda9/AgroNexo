'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { GetMatchesResult, Match } from '@/core/models/match.model';

/** El backend ya acota la lista al usuario: al productor le devuelve lo que envió y al profesional lo que recibió. */
const PAGE_SIZE = 50;

/**
 * Pedidos de match del usuario logueado (`GET /api/v1/matches`), con la ficha de necesidad de cada uno.
 * La respuesta es paginada; esta primera versión muestra la primera página.
 */
export async function getMatchesAction(): Promise<GetMatchesResult> {
  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/matches?pageSize=${PAGE_SIZE}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 403) return { status: 'forbidden' };
    if (!res.ok) return { status: 'unavailable' };

    const body = (await res.json()) as { items?: Match[] };
    return { status: 'ok', matches: Array.isArray(body.items) ? body.items : [] };
  } catch {
    return { status: 'unavailable' };
  }
}
