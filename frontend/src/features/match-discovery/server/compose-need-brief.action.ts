'use server';

import { GoogleGenAI } from '@google/genai';
import { getSessionUser } from '@/core/auth/server';
import { NEED_CROPS, NEED_TOPICS } from '../config/catalog';
import {
  BRIEF_RESPONSE_SCHEMA,
  BRIEF_SYSTEM_INSTRUCTION,
  briefUserInput,
  toBriefSummary,
} from '../lib/need-brief';
import type { NeedInterpretation } from '../lib/interpret-need';
import { createRateLimiter } from './rate-limit';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
/** La ficha se puede redactar con calma: el productor ya tiene un borrador y la IA solo lo mejora. */
const TIMEOUT_MS = 6000;
const MAX_TEXT_LENGTH = 600;
const MAX_PLACE_LENGTH = 150;

const isRateLimited = createRateLimiter(8);

function warnFallback(reason: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[match-discovery] ${reason}: se usa la plantilla de la ficha.`);
  }
}

/**
 * Redacta con Gemini la ficha de necesidad que va a leer el profesional, a partir de lo ya interpretado.
 * Devuelve `null` ante cualquier problema (sin clave, sin sesión, límite, red, respuesta inválida o con datos de
 * contacto): el llamador usa entonces la plantilla `draftSummary`, así que enviar el pedido nunca depende de la IA.
 * Una Server Action es un endpoint público: la entrada se acota y se filtra contra el catálogo.
 */
export async function composeNeedBriefAction(
  need: NeedInterpretation,
  placeLabel: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof need?.text !== 'string' || typeof placeLabel !== 'string') return null;

  const user = await getSessionUser();
  if (!user || isRateLimited(user.id)) return null;

  const topicIds = NEED_TOPICS.map((topic) => topic.id);
  const cropIds: string[] = NEED_CROPS.map((crop) => crop.id);
  const safeNeed: NeedInterpretation = {
    text: need.text.trim().slice(0, MAX_TEXT_LENGTH),
    role: need.role,
    topics: (Array.isArray(need.topics) ? need.topics : [])
      .filter((id) => topicIds.includes(id))
      .slice(0, 5),
    crops: (Array.isArray(need.crops) ? need.crops : [])
      .filter((id) => cropIds.includes(id))
      .slice(0, 5),
    activity: need.activity,
    hectares: typeof need.hectares === 'number' ? need.hectares : null,
    urgency: need.urgency,
    place: null,
  };
  const place = placeLabel.trim().slice(0, MAX_PLACE_LENGTH);
  if (!safeNeed.text || !place) return null;

  try {
    const client = new GoogleGenAI({ apiKey });
    const interaction = await client.interactions.create(
      {
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        system_instruction: BRIEF_SYSTEM_INSTRUCTION,
        input: briefUserInput(safeNeed, place),
        generation_config: { temperature: 0.3 },
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: BRIEF_RESPONSE_SCHEMA,
        },
        store: false,
      },
      { timeout_ms: TIMEOUT_MS, retries: { strategy: 'none' } }
    );

    const summary = toBriefSummary(interaction.output_text);
    if (!summary) warnFallback('la ficha de la IA no se pudo usar');
    return summary;
  } catch (error) {
    const status = (error as { status?: number })?.status;
    warnFallback(status ? `Gemini respondió ${status}` : 'Gemini no respondió a tiempo');
    return null;
  }
}
