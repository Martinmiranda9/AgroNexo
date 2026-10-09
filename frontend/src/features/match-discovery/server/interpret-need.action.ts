'use server';

import { GoogleGenAI } from '@google/genai';
import { getSessionUser } from '@/core/auth/server';
import {
  NEED_RESPONSE_SCHEMA,
  buildSystemInstruction,
  toInterpretation,
} from '../lib/ai-interpretation';
import type { NeedInterpretation } from '../lib/interpret-need';
import { createRateLimiter } from './rate-limit';

/** Modelo gratuito y liviano de Google AI Studio; se puede cambiar con `GEMINI_MODEL` sin tocar código. */
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
/** Si Gemini no responde a tiempo, la pantalla sigue con el intérprete local. */
const TIMEOUT_MS = 4000;
/** Largo máximo de texto que se le manda al modelo. */
const MAX_TEXT_LENGTH = 600;
/** Límite por usuario: cada llamada gasta cuota de Gemini. */
const isRateLimited = createRateLimiter(8);

/** Solo en desarrollo: sin esto, un fallo de Gemini se vería como "la IA no entiende" y no como un error. */
function warnFallback(reason: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[match-discovery] ${reason}: se usa el intérprete local.`);
  }
}

/**
 * Interpreta el pedido del productor con Gemini (Google AI Studio) y devuelve la misma forma que el intérprete
 * local. Devuelve `null` ante cualquier problema (sin clave, sin sesión, límite, error de red, respuesta inválida)
 * para que el llamador use `interpretNeedLocally`: la búsqueda nunca depende de la IA.
 * La clave `GEMINI_API_KEY` vive solo en el servidor.
 */
export async function interpretNeedWithAiAction(
  text: string,
  fallbackHectares: number | null
): Promise<NeedInterpretation | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof text !== 'string') return null;

  const trimmed = text.trim().slice(0, MAX_TEXT_LENGTH);
  if (!trimmed) return null;

  const user = await getSessionUser();
  if (!user || isRateLimited(user.id)) return null;

  try {
    const client = new GoogleGenAI({ apiKey });
    const interaction = await client.interactions.create(
      {
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        system_instruction: buildSystemInstruction(),
        input: trimmed,
        generation_config: { temperature: 0 },
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: NEED_RESPONSE_SCHEMA,
        },
        store: false,
      },
      { timeout_ms: TIMEOUT_MS, retries: { strategy: 'none' } }
    );

    const need = toInterpretation(interaction.output_text, trimmed, fallbackHectares);
    if (!need) warnFallback('la respuesta no se pudo interpretar');
    return need;
  } catch (error) {
    const status = (error as { status?: number })?.status;
    warnFallback(
      status ? `Gemini respondió ${status}` : 'Gemini no respondió a tiempo o falló la red'
    );
    return null;
  }
}
