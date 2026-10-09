'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { Match, MatchDecision, UpdateMatchStatusResult } from '@/core/models/match.model';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DECISIONS: readonly MatchDecision[] = ['Active', 'Rejected'];

/**
 * El profesional acepta (`Active`) o rechaza (`Rejected`) un pedido de match (`PATCH /api/v1/matches/{id}/status`).
 * El backend solo lo permite al profesional invitado y solo mientras el pedido está pendiente.
 */
export async function updateMatchStatusAction(
  matchId: string,
  decision: MatchDecision
): Promise<UpdateMatchStatusResult> {
  if (typeof matchId !== 'string' || !UUID.test(matchId)) return { status: 'not-found' };
  if (!DECISIONS.includes(decision)) return { status: 'invalid' };

  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/matches/${matchId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: decision }),
      cache: 'no-store',
    });

    if (res.ok) return { status: 'ok', match: (await res.json()) as Match };
    if (res.status === 404) return { status: 'not-found' };
    if (res.status === 400) return { status: 'invalid' };
    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 403) return { status: 'forbidden' };
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}
