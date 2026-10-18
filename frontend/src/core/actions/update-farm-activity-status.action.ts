'use server';

import type {
  FarmActivity,
  FarmActivityStatus,
  FarmMutationResult,
} from '@/core/models/farm-dashboard.model';
import { farmMutation, isGuid } from './farm-dashboard-request';

/** El dueño o quien registró la actividad le cambia el estado (Inicio, En proceso, Finalizado). */
export async function updateFarmActivityStatusAction(
  farmId: string,
  activityId: string,
  status: FarmActivityStatus
): Promise<FarmMutationResult<FarmActivity>> {
  if (!isGuid(farmId) || !isGuid(activityId)) return { status: 'not-found' };

  return farmMutation<FarmActivity>(
    `/api/v1/farms/${farmId}/activities/${activityId}/status`,
    'PATCH',
    { status }
  );
}
