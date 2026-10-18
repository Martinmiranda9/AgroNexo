'use server';

import {
  ACTIVITY_NOTES_MAX,
  ACTIVITY_TITLE_MAX,
  type FarmActivity,
  type FarmActivityInput,
  type FarmMutationResult,
} from '@/core/models/farm-dashboard.model';
import { farmMutation, isGuid } from './farm-dashboard-request';

/** El dueño o un profesional del equipo registra una actividad; el backend le asigna la campaña de la fecha. */
export async function createFarmActivityAction(
  farmId: string,
  input: FarmActivityInput
): Promise<FarmMutationResult<FarmActivity>> {
  if (!isGuid(farmId)) return { status: 'not-found' };

  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  const notes = typeof input?.notes === 'string' ? input.notes.trim() : '';
  const hectares = input?.hectaresWorked;
  if (!title || title.length > ACTIVITY_TITLE_MAX || notes.length > ACTIVITY_NOTES_MAX)
    return { status: 'invalid', message: null };
  if (hectares !== null && hectares !== undefined && !(Number.isFinite(hectares) && hectares > 0))
    return { status: 'invalid', message: null };

  return farmMutation<FarmActivity>(`/api/v1/farms/${farmId}/activities`, 'POST', {
    type: input.type,
    title,
    notes: notes || null,
    date: input.date,
    status: input.status,
    lotId: isGuid(input.lotId) ? input.lotId : null,
    hectaresWorked: hectares ?? null,
  });
}
