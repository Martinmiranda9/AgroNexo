'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { GetWorkspacesResult, Workspace } from '@/core/models/farm.model';

/**
 * Campos del usuario logueado (`GET /api/v1/workspaces`): al productor le devuelve los suyos (también los archivados)
 * y al profesional los campos donde está en el equipo.
 */
export async function getWorkspacesAction(): Promise<GetWorkspacesResult> {
  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.status === 401) return { status: 'unauthorized' };
    if (!res.ok) return { status: 'unavailable' };

    const body = (await res.json()) as Workspace[];
    return { status: 'ok', workspaces: Array.isArray(body) ? body : [] };
  } catch {
    return { status: 'unavailable' };
  }
}
