'use server';

import type {
  Campaign,
  CampaignInput,
  FarmMutationResult,
} from '@/core/models/farm-dashboard.model';
import { farmMutation, isGuid } from './farm-dashboard-request';

const CAMPAIGN_NAME = /^\d{4}\/\d{2}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** El productor dueño crea una campaña del campo ("2026/27"). */
export async function createCampaignAction(
  farmId: string,
  input: CampaignInput
): Promise<FarmMutationResult<Campaign>> {
  if (!isGuid(farmId)) return { status: 'not-found' };

  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  if (!CAMPAIGN_NAME.test(name) || !ISO_DATE.test(input.startsOn) || !ISO_DATE.test(input.endsOn))
    return { status: 'invalid', message: null };

  return farmMutation<Campaign>(`/api/v1/farms/${farmId}/campaigns`, 'POST', {
    name,
    startsOn: input.startsOn,
    endsOn: input.endsOn,
  });
}
