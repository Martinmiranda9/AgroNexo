import type { NeedUrgency } from '../types/need-brief';

/** Temas que puede pedir un productor, por id estable. Es la única fuente de las etiquetas en español. */
export const NEED_TOPIC_LABELS = {
  'extensive-crops': 'Cultivos extensivos',
  'precision-ag': 'Agricultura de precisión',
  pastures: 'Pasturas y forraje',
  'farm-taxes': 'Impuestos agropecuarios',
  'grain-settlement': 'Liquidación de granos',
  'farm-credit': 'Créditos y garantías',
  'farm-leases': 'Arrendamientos',
  succession: 'Sucesiones',
  'campaign-financing': 'Financiamiento de campaña',
} as const;

export type NeedTopicId = keyof typeof NEED_TOPIC_LABELS;

/** Cultivos que se pueden nombrar en un pedido, por id estable. */
export const CROP_LABELS = {
  soybean: 'Soja',
  corn: 'Maíz',
  wheat: 'Trigo',
  sunflower: 'Girasol',
  barley: 'Cebada',
  sorghum: 'Sorgo',
  peanut: 'Maní',
} as const;

export type CropId = keyof typeof CROP_LABELS;

export const URGENCY_LABELS: Record<NeedUrgency, string> = {
  ThisWeek: 'Esta semana',
  ThisMonth: 'Este mes',
};

/** Etiqueta en español de un id del catálogo; si el id es desconocido (catálogo más nuevo) se omite. */
export const topicLabel = (id: string): string | null =>
  (NEED_TOPIC_LABELS as Record<string, string>)[id] ?? null;

export const cropLabel = (id: string): string | null =>
  (CROP_LABELS as Record<string, string>)[id] ?? null;
