'use server';

import { getProducerProfileAction } from '@/core/actions/get-producer-profile.action';
import { getSessionUser } from '@/core/auth/server';
import type { SearchLocation } from '@/core/models/match.model';
import { resolveNamedPlace } from '@/core/services/location.service';

/** Largo máximo del lugar que se acepta; el modelo ya lo limita, pero la acción es un endpoint público. */
const MAX_PLACE_LENGTH = 80;

/**
 * Punto de búsqueda para el lugar que el productor nombró en su pedido, combinado con el de su registro (para
 * elegir entre localidades homónimas y para que "Córdoba" signifique su propia provincia). `null` si no hay
 * sesión o no se encuentra el lugar: la pantalla busca entonces cerca de su campo.
 */
export async function resolvePlaceAction(place: string): Promise<SearchLocation | null> {
  if (typeof place !== 'string') return null;
  const text = place.trim().slice(0, MAX_PLACE_LENGTH);
  if (!text || !(await getSessionUser())) return null;

  try {
    const profile = await getProducerProfileAction();
    return await resolveNamedPlace(text, {
      country: profile?.country,
      province: profile?.province,
      city: profile?.city,
    });
  } catch {
    return null;
  }
}
