'use server';

import type { FarmMutationResult, Lot, LotCropInput } from '@/core/models/farm-dashboard.model';
import { farmMutation, isGuid } from './farm-dashboard-request';

/** El productor dueño carga un cultivo en un lote para una campaña. */
export async function addLotCropAction(
  farmId: string,
  lotId: string,
  input: LotCropInput
): Promise<FarmMutationResult<Lot>> {
  if (!isGuid(farmId) || !isGuid(lotId)) return { status: 'not-found' };
  if (!isGuid(input?.campaignId) || !input.crop) return { status: 'invalid', message: null };

  return farmMutation<Lot>(`/api/v1/farms/${farmId}/lots/${lotId}/crops`, 'POST', {
    campaignId: input.campaignId,
    crop: input.crop,
    sowingDate: input.sowingDate || null,
    expectedHarvestDate: input.expectedHarvestDate || null,
  });
}
