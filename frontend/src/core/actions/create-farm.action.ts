'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import {
  FARM_DESCRIPTION_MAX,
  FARM_HECTARES_MAX,
  FARM_NAME_MAX,
  FARM_NAME_MIN,
  type CreateFarmInput,
  type CreateFarmResult,
  type CreatedFarm,
} from '@/core/models/farm.model';

/** El productor crea un campo (`POST /api/v1/farms`); el backend le asigna el ID legible (200001…). */
export async function createFarmAction(input: CreateFarmInput): Promise<CreateFarmResult> {
  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const description = typeof input?.description === 'string' ? input.description.trim() : '';
  const hectares = Number(input?.totalHectares ?? 0);

  if (name.length < FARM_NAME_MIN || name.length > FARM_NAME_MAX) return { status: 'invalid' };
  if (description.length > FARM_DESCRIPTION_MAX) return { status: 'invalid' };
  if (!Number.isFinite(hectares) || hectares < 0 || hectares > FARM_HECTARES_MAX)
    return { status: 'invalid' };

  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/farms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: description || null, totalHectares: hectares }),
      cache: 'no-store',
    });

    if (res.ok) {
      const farm = (await res.json()) as CreatedFarm;
      return { status: 'created', farm: { id: farm.id, publicId: farm.publicId, name: farm.name } };
    }
    if (res.status === 400) return { status: 'invalid' };
    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 403) return { status: 'forbidden' };
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}
