import type { SearchableRole } from '@/core/models/identity.model';
import {
  ACTIVITY_WORDS,
  NEED_CROPS,
  NEED_TOPICS,
  ROLE_WORDS,
  SEARCHABLE_ROLES,
  roleFromTopics,
  URGENCY_WORDS,
  type Activity,
  type Urgency,
} from '../config/catalog';
import { interpretNeedWithAiAction } from '../server/interpret-need.action';

/** Lo que se entendió del pedido del productor. Es la entrada de la búsqueda y de la explicación. */
export interface NeedInterpretation {
  /** Texto original, tal como lo escribió. */
  text: string;
  /** Profesión pedida; `null` si no se pudo deducir (se muestran todas). */
  role: SearchableRole | null;
  /** Ids de `NEED_TOPICS`. */
  topics: string[];
  activity: Activity | null;
  hectares: number | null;
  urgency: Urgency | null;
  /** Lugar que nombró el productor ("Río Cuarto", "Córdoba"); `null` si no nombró ninguno (se usa el de su registro). */
  place: string | null;
  /** Ids de `NEED_CROPS` ('soybean', 'corn'…); vacío si no nombró ninguno. */
  crops: string[];
}

/** Minúsculas y sin tildes, para comparar texto escrito a mano. */
export function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** `true` si alguna palabra empieza con uno de los prefijos ("retenc" → "retenciones"; "iva" no entra en "activa"). */
export function matchesAnyPrefix(foldedText: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => new RegExp(`\\b${escapeRegExp(prefix)}`).test(foldedText));
}

function detectRole(text: string, topicIds: string[]): SearchableRole | null {
  const named = SEARCHABLE_ROLES.find((role) => matchesAnyPrefix(text, ROLE_WORDS[role]));
  if (named) return named;

  // Sin profesión explícita, manda el tema que más aparece ("retenciones" → contador).
  return roleFromTopics(topicIds);
}

/** Cultivos nombrados, como palabra entera ("mani" no entra en "manifiesto"). */
function detectCrops(text: string): string[] {
  return NEED_CROPS.filter((crop) =>
    new RegExp(String.raw`\b(?:${crop.words.map(escapeRegExp).join('|')})\b`).test(text)
  ).map((crop) => crop.id);
}

function detectActivity(text: string): Activity | null {
  const found = (Object.keys(ACTIVITY_WORDS) as Array<keyof typeof ACTIVITY_WORDS>).filter(
    (activity) => matchesAnyPrefix(text, ACTIVITY_WORDS[activity])
  );
  if (found.includes('Tambo')) return 'Tambo';
  if (found.includes('Agricultura') && found.includes('Ganadería')) return 'Mixto';
  if (/\bmixto\b/.test(text)) return 'Mixto';
  return found[0] ?? null;
}

function detectUrgency(text: string): Urgency | null {
  return (
    (Object.keys(URGENCY_WORDS) as Urgency[]).find((urgency) =>
      matchesAnyPrefix(text, URGENCY_WORDS[urgency])
    ) ?? null
  );
}

/** "350 ha", "1.200 hectáreas". */
function detectHectares(original: string): number | null {
  const match = /(\d{1,3}(?:[.\s]\d{3})+|\d+)\s*(?:ha\b|has\b|hect)/i.exec(original);
  return match ? Number(match[1].replace(/[.\s]/g, '')) : null;
}

/** Versión determinística, sin red. Es lo que usa la pantalla hoy y el respaldo cuando la IA no esté disponible. */
export function interpretNeedLocally(text: string): NeedInterpretation {
  const original = text.trim();
  const folded = fold(original);
  const topics = NEED_TOPICS.filter((topic) => matchesAnyPrefix(folded, topic.keywords)).map(
    (topic) => topic.id
  );
  const role = detectRole(folded, topics);

  return {
    text: original,
    role,
    // Un tema de otra profesión no aplica ("contrato" no vuelve abogado a un pedido de contador).
    topics: topics.filter((id) => !role || NEED_TOPICS.find((t) => t.id === id)?.role === role),
    activity: detectActivity(folded),
    hectares: detectHectares(original),
    urgency: detectUrgency(folded),
    // El lugar lo extrae la IA: sin ella se busca cerca del lugar de registro.
    place: null,
    crops: detectCrops(folded),
  };
}

/**
 * Punto de entrada de la interpretación. Primero intenta con Gemini (Server Action, la clave nunca sale del servidor)
 * y, si no hay clave, no responde a tiempo o devuelve algo inválido, usa `interpretNeedLocally`. La búsqueda no
 * depende de la IA: sin ella la pantalla funciona igual, con menos comprensión del texto libre.
 */
export async function interpretNeed(text: string): Promise<NeedInterpretation> {
  const local = interpretNeedLocally(text);
  try {
    return (await interpretNeedWithAiAction(text, local.hectares)) ?? local;
  } catch {
    return local;
  }
}
