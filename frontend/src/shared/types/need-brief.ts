/** Urgencia con que el backend serializa el enum `MatchUrgency` (`JsonStringEnumConverter`). */
export type NeedUrgency = 'ThisWeek' | 'ThisMonth';

/**
 * Ficha de necesidad: el contexto del pedido que el productor le manda al profesional.
 * Mismo formato que acepta `POST /api/v1/matches` y que devuelve `GET /api/v1/matches`.
 * Los temas y cultivos son ids estables del catálogo; las etiquetas en español salen de `NEED_TOPIC_LABELS` y
 * `CROP_LABELS`. No lleva coordenadas ni datos de contacto: la zona viaja solo como texto.
 */
export interface NeedBrief {
  /** Texto descriptivo: "Productor de Berrotarán, 350 ha de soja, necesita ayuda con retenciones, este mes." */
  summary: string;
  /** Zona en texto: "Berrotarán, Córdoba". */
  placeLabel?: string | null;
  hectares?: number | null;
  urgency?: NeedUrgency | null;
  topics: string[];
  crops: string[];
}
