import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { FarmMutationResult } from '@/core/models/farm-dashboard.model';

/** Detalle en español del ProblemDetails del backend, si vino. */
async function problemDetail(res: Response): Promise<string | null> {
  try {
    const body = (await res.json()) as { detail?: unknown };
    return typeof body.detail === 'string' ? body.detail : null;
  } catch {
    return null;
  }
}

/**
 * Alta o cambio en el tablero del campo con el token del usuario. Traduce los códigos del backend a un resultado que la
 * pantalla sabe mostrar.
 */
export async function farmMutation<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'PUT',
  body: unknown
): Promise<FarmMutationResult<T>> {
  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (res.ok) return { status: 'ok', data: (await res.json()) as T };
    if (res.status === 400) return { status: 'invalid', message: await problemDetail(res) };
    if (res.status === 409) return { status: 'conflict', message: await problemDetail(res) };
    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 403) return { status: 'forbidden' };
    if (res.status === 404) return { status: 'not-found' };
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}

/** Ids de la ruta: el backend solo acepta GUIDs, así que se cortan antes de armar la URL. */
export const isGuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
