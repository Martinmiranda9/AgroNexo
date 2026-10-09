'use client';

import { useEffect, useState } from 'react';
import ThoughtLine from '@/ui/components/ThoughtLine';

/** Lo que hace la búsqueda, en el orden en que lo hace. También se muestra plegado junto a los resultados. */
export const SEARCH_STEPS = [
  'Leyendo lo que necesitás',
  'Buscando profesionales en la zona',
  'Ordenando por quién encaja mejor',
];
const STEP_MS = 350;

interface SearchingStateProps {
  /** Lo que escribió el productor: se mantiene a la vista mientras se busca. */
  query: string;
}

/**
 * Progreso mientras se interpreta el pedido y se consulta al backend: la línea "pensando" de React Bits con los pasos
 * apareciendo de a uno. El último queda en curso hasta que llegan los resultados.
 */
export default function SearchingState({ query }: SearchingStateProps) {
  const [shown, setShown] = useState(1);

  useEffect(() => {
    const timer = setInterval(
      () => setShown((count) => Math.min(count + 1, SEARCH_STEPS.length)),
      STEP_MS
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto mt-20 flex max-w-[440px] flex-col gap-8 sm:mt-28">
      <div>
        <p className="text-body-sm text-olive font-semibold">Buscando</p>
        <p className="text-body-lg tracking-heading text-pine mt-1 line-clamp-3 font-medium">
          “{query}”
        </p>
      </div>

      <ThoughtLine
        working
        label="Buscando profesionales…"
        steps={SEARCH_STEPS.slice(0, shown)}
        glyph="sparkle"
        collapsible={false}
        showTimer
        fontSize={18}
        glyphColor="var(--color-olive)"
        className="text-pine"
      />
    </div>
  );
}
