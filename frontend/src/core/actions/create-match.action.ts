'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { CreateMatchResult } from '@/core/models/match.model';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Envía la solicitud de match a un profesional (`POST /api/v1/matches`). El backend la crea en estado Pending
 * y responde 409 si ya hay un match Pending/Activo con el mismo profesional.
 */
export async function createMatchAction(professionalId: string): Promise<CreateMatchResult> {
  if (typeof professionalId !== 'string' || !UUID.test(professionalId))
    return { status: 'not-found' };

  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/matches`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId }),
      cache: 'no-store',
    });

    if (res.status === 201)
      return { status: 'created', matchId: ((await res.json()) as { id: string }).id };
    if (res.status === 409) return { status: 'conflict' };
    if (res.status === 404) return { status: 'not-found' };
    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 403) return { status: 'forbidden' };
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}
