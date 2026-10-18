'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { FarmDashboard, GetFarmDashboardResult } from '@/core/models/farm-dashboard.model';
import { isGuid } from './farm-dashboard-request';

/**
 * Tablero compartido del campo (`GET /api/v1/farms/{id}/dashboard`), igual para el productor dueño y su equipo. Sin
 * campaña, el backend elige la que contiene hoy o la más reciente.
 */
export async function getFarmDashboardAction(
  farmId: string,
  campaignId?: string | null
): Promise<GetFarmDashboardResult> {
  if (!isGuid(farmId)) return { status: 'not-found' };

  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  const query = isGuid(campaignId) ? `?campaignId=${campaignId}` : '';

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/farms/${farmId}/dashboard${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.ok) return { status: 'ok', dashboard: (await res.json()) as FarmDashboard };
    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 404) return { status: 'not-found' };
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}
