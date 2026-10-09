'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { composeNeedBriefAction } from '../server/compose-need-brief.action';
import type { NeedInterpretation } from '../lib/interpret-need';
import { draftSummary } from '../lib/need-brief';

/** Fichas ya redactadas por la IA en esta sesión: abrir el diálogo con otro profesional no vuelve a llamar. */
const COMPOSED = new Map<string, string>();

const cacheKey = (need: NeedInterpretation, placeLabel: string) =>
  JSON.stringify([
    need.text,
    need.role,
    need.topics,
    need.crops,
    need.hectares,
    need.urgency,
    placeLabel,
  ]);

/**
 * Texto de la ficha de necesidad que se manda con el pedido. Arranca con la plantilla (instantánea) y, en cuanto
 * Gemini responde, la reemplaza por la versión redactada, salvo que el productor ya haya empezado a editarla.
 */
export function useNeedBriefDraft(need: NeedInterpretation | null, placeLabel: string) {
  const template = useMemo(() => (need ? draftSummary(need, placeLabel) : ''), [need, placeLabel]);
  const [summary, setSummary] = useState(template);
  const [composing, setComposing] = useState(false);
  // Una vez que el productor toca el texto, la IA no lo pisa.
  const edited = useRef(false);

  useEffect(() => {
    if (!need) return;
    const key = cacheKey(need, placeLabel);
    const cached = COMPOSED.get(key);
    if (cached) {
      if (!edited.current) setSummary(cached);
      return;
    }

    let cancelled = false;
    setComposing(true);
    composeNeedBriefAction(need, placeLabel)
      .then((composed) => {
        if (composed) COMPOSED.set(key, composed);
        if (!cancelled && composed && !edited.current) setSummary(composed);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setComposing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [need, placeLabel]);

  const edit = (value: string) => {
    edited.current = true;
    setSummary(value);
  };

  return { summary, composing, edit };
}
