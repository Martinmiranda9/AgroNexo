'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type {
  MatchDiscoveryResult,
  SearchProfessionalsInput,
  SearchProfessionalsResult,
} from '@/core/models/match.model';

const isCoordinate = (value: unknown, limit: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;

/**
 * Pide al backend el ranking de profesionales para un punto (`POST /api/v1/match-discovery`, política IsProducer).
 * El orden lo calcula el backend (proximidad, matrícula verificada, especialidad, experiencia y cupo):
 * el frontend no lo recalcula.
 */
export async function searchProfessionalsAction(
  input: SearchProfessionalsInput
): Promise<SearchProfessionalsResult> {
  // Las Server Actions son endpoints públicos: se valida la entrada igual que en el backend.
  if (!isCoordinate(input?.latitude, 90) || !isCoordinate(input?.longitude, 180)) {
    return { status: 'unavailable' };
  }

  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/match-discovery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: input.latitude,
        longitude: input.longitude,
        requiresFieldPresence: Boolean(input.requiresFieldPresence),
      }),
      cache: 'no-store',
    });

    if (!res.ok && process.env.NODE_ENV !== 'production') {
      console.warn(`[match-discovery] el backend respondió ${res.status} a la búsqueda.`);
    }
    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 403) return { status: 'forbidden' };
    if (!res.ok) return { status: 'unavailable' };

    return { status: 'ok', discovery: (await res.json()) as MatchDiscoveryResult };
  } catch {
    return { status: 'unavailable' };
  }
}
