import { cropLabel, topicLabel } from '@/shared/constants/need-labels';
import type { NeedBrief } from '@/shared/types/need-brief';

export interface NeedTag {
  /** Estable, para la `key` de React. */
  key: string;
  label: string;
  variant: 'neutral' | 'positive' | 'alert';
  icon?: 'clock' | 'pin';
  /** Cifras en Geist Mono. */
  mono?: boolean;
}

/**
 * Etiquetas que resumen la ficha de un vistazo, en orden de importancia: urgencia, zona, hectáreas, cultivos y
 * temas. "Urgente" usa la variante `alert` (el rojo `danger` queda reservado para error y rechazo).
 * Los ids que el catálogo no conoce (un catálogo más nuevo) se omiten en vez de mostrarse crudos.
 */
export function needBriefTags(brief: NeedBrief): NeedTag[] {
  const tags: NeedTag[] = [];

  if (brief.urgency === 'ThisWeek') {
    tags.push({ key: 'urgency', label: 'Urgente', variant: 'alert', icon: 'clock' });
  } else if (brief.urgency === 'ThisMonth') {
    tags.push({ key: 'urgency', label: 'Este mes', variant: 'neutral', icon: 'clock' });
  }

  if (brief.placeLabel) {
    tags.push({ key: 'place', label: brief.placeLabel, variant: 'neutral', icon: 'pin' });
  }

  if (brief.hectares) {
    tags.push({
      key: 'hectares',
      label: `${brief.hectares.toLocaleString('es-AR')} ha`,
      variant: 'neutral',
      mono: true,
    });
  }

  for (const id of brief.crops) {
    const label = cropLabel(id);
    if (label) tags.push({ key: `crop-${id}`, label, variant: 'positive' });
  }

  for (const id of brief.topics) {
    const label = topicLabel(id);
    if (label) tags.push({ key: `topic-${id}`, label, variant: 'neutral' });
  }

  return tags;
}

/** Iniciales para el avatar: "Esteban Bauer" → "EB". */
export function initialsOfName(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase() || 'AN';
}
