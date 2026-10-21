'use server';

import {
  LOT_NAME_MAX,
  type FarmMutationResult,
  type Lot,
  type LotInput,
} from '@/core/models/farm-dashboard.model';
import type { GeoPoint } from '@/core/models/farm.model';
import { farmMutation, isGuid } from './farm-dashboard-request';

/** Un lote dibujado necesita al menos 3 esquinas. */
const MIN_CORNERS = 3;

const isGeoPoint = (point: unknown): point is GeoPoint => {
  const p = point as GeoPoint | null;
  return (
    typeof p?.latitude === 'number' &&
    typeof p?.longitude === 'number' &&
    Math.abs(p.latitude) <= 90 &&
    Math.abs(p.longitude) <= 180
  );
};

/**
 * El productor dueño o el agrónomo del equipo crean un lote con sus hectáreas declaradas y, si lo dibujaron, su
 * ubicación en el mapa (solo referencia: no cambia las hectáreas).
 */
export async function createLotAction(
  farmId: string,
  input: LotInput
): Promise<FarmMutationResult<Lot>> {
  if (!isGuid(farmId)) return { status: 'not-found' };

  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  if (!name || name.length > LOT_NAME_MAX) return { status: 'invalid', message: null };

  const hectares = Number(input?.hectares);
  if (!Number.isFinite(hectares) || hectares <= 0)
    return { status: 'invalid', message: 'Cargá las hectáreas del lote.' };

  const corners = input.boundaryCoordinates;
  if (corners === undefined || corners.length === 0)
    return farmMutation<Lot>(`/api/v1/farms/${farmId}/lots`, 'POST', { name, hectares });

  if (!Array.isArray(corners) || corners.length < MIN_CORNERS || !corners.every(isGeoPoint))
    return {
      status: 'invalid',
      message: 'Dibujá el lote con al menos 3 esquinas o borrá el dibujo.',
    };

  const boundaryCoordinates = corners.map(({ latitude, longitude }) => ({ latitude, longitude }));
  return farmMutation<Lot>(`/api/v1/farms/${farmId}/lots`, 'POST', {
    name,
    hectares,
    boundaryCoordinates,
  });
}
