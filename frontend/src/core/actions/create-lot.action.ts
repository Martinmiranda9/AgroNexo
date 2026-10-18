'use server';

import {
  LOT_NAME_MAX,
  type FarmMutationResult,
  type Lot,
  type LotInput,
} from '@/core/models/farm-dashboard.model';
import { farmMutation, isGuid } from './farm-dashboard-request';

/** El productor dueño crea un lote del campo. */
export async function createLotAction(
  farmId: string,
  input: LotInput
): Promise<FarmMutationResult<Lot>> {
  if (!isGuid(farmId)) return { status: 'not-found' };

  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const hectares = Number(input?.hectares);
  if (!name || name.length > LOT_NAME_MAX || !Number.isFinite(hectares) || hectares <= 0)
    return { status: 'invalid', message: null };

  return farmMutation<Lot>(`/api/v1/farms/${farmId}/lots`, 'POST', { name, hectares });
}
