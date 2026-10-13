'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { AddFarmMemberResult, FarmMember } from '@/core/models/farm.model';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * El productor suma un profesional al equipo de un campo (`POST /api/v1/farms/{id}/members`). El backend solo lo
 * permite con un match aceptado entre los dos y con el campo sin archivar.
 */
export async function addFarmMemberAction(
  farmId: string,
  professionalId: string
): Promise<AddFarmMemberResult> {
  if (typeof farmId !== 'string' || !UUID.test(farmId)) return { status: 'not-found' };
  if (typeof professionalId !== 'string' || !UUID.test(professionalId))
    return { status: 'not-found' };

  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/farms/${farmId}/members`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId }),
      cache: 'no-store',
    });

    if (res.ok) return { status: 'added', member: (await res.json()) as FarmMember };
    if (res.status === 409) return { status: 'conflict' };
    if (res.status === 400) return { status: 'invalid' };
    if (res.status === 404) return { status: 'not-found' };
    if (res.status === 401) return { status: 'unauthorized' };
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}
