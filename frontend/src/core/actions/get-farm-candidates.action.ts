'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { FarmCandidate, GetFarmCandidatesResult } from '@/core/models/farm.model';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Profesionales que el productor puede sumar a un campo (`GET /api/v1/farms/{id}/candidates`): los de sus matches
 * aceptados que todavía no están en el equipo. El filtro por profesión se hace en la pantalla, sobre esta lista.
 */
export async function getFarmCandidatesAction(farmId: string): Promise<GetFarmCandidatesResult> {
  if (typeof farmId !== 'string' || !UUID.test(farmId)) return { status: 'not-found' };

  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/farms/${farmId}/candidates`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 404) return { status: 'not-found' };
    if (!res.ok) return { status: 'unavailable' };

    const body = (await res.json()) as FarmCandidate[];
    return { status: 'ok', candidates: Array.isArray(body) ? body : [] };
  } catch {
    return { status: 'unavailable' };
  }
}
