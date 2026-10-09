'use server';

import { z } from 'zod';
import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { CreateMatchResult } from '@/core/models/match.model';
import type { NeedBrief } from '@/shared/types/need-brief';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ITEM_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Mismas reglas que `NeedBrief` del backend: una Server Action es un endpoint público, se valida igual. */
const needBriefSchema = z.object({
  summary: z.string().trim().min(10).max(600),
  placeLabel: z.string().trim().max(150).nullish(),
  hectares: z.number().int().min(1).max(1_000_000).nullish(),
  urgency: z.enum(['ThisWeek', 'ThisMonth']).nullish(),
  topics: z.array(z.string().max(50).regex(ITEM_ID)).max(5),
  crops: z.array(z.string().max(50).regex(ITEM_ID)).max(5),
});

/**
 * Envía la solicitud de match a un profesional (`POST /api/v1/matches`) junto con la ficha de necesidad: el contexto
 * que el productor describió (resumen, zona, hectáreas, urgencia, temas y cultivos). El backend la crea en estado
 * Pending y responde 409 si ya hay un match Pending/Activo con el mismo profesional.
 */
export async function createMatchAction(
  professionalId: string,
  needBrief?: NeedBrief
): Promise<CreateMatchResult> {
  if (typeof professionalId !== 'string' || !UUID.test(professionalId))
    return { status: 'not-found' };

  let brief: z.infer<typeof needBriefSchema> | undefined;
  if (needBrief !== undefined) {
    const parsed = needBriefSchema.safeParse(needBrief);
    if (!parsed.success) return { status: 'invalid' };
    brief = parsed.data;
  }

  const token = await getBackendToken();
  if (!token) return { status: 'unauthorized' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/matches`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId, needBrief: brief }),
      cache: 'no-store',
    });

    if (res.status === 201)
      return { status: 'created', matchId: ((await res.json()) as { id: string }).id };
    if (res.status === 409) return { status: 'conflict' };
    if (res.status === 404) return { status: 'not-found' };
    if (res.status === 400) return { status: 'invalid' };
    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 403) return { status: 'forbidden' };
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}
