'use client';

import { useEffect, useState } from 'react';
import { CheckIcon } from '@phosphor-icons/react';
import { cn } from '@/shared/utils/cn';

const STEPS = [
  'Entendiendo tu pedido',
  'Buscando profesionales en tu zona',
  'Ordenando por afinidad',
];
const STEP_MS = 350;

/** Progreso mientras se interpreta el pedido y se consulta al backend. */
export default function SearchingState() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((step) => Math.min(step + 1, STEPS.length - 1)),
      STEP_MS
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto mt-28 flex max-w-[380px] flex-col gap-3.5"
    >
      <span className="sr-only">Buscando profesionales</span>
      {STEPS.map((label, index) => (
        <div
          key={label}
          className={cn(
            'text-body flex items-center gap-3 transition-opacity',
            index <= current ? 'opacity-100' : 'opacity-40'
          )}
        >
          {index < current ? (
            <span className="bg-pine text-beige flex size-5 items-center justify-center rounded-full">
              <CheckIcon size={12} weight="bold" aria-hidden />
            </span>
          ) : (
            <span
              className={cn(
                'size-5 rounded-full border-2',
                index === current ? 'border-pine animate-pulse' : 'border-pine/30'
              )}
            />
          )}
          <span className="text-pine">{label}</span>
        </div>
      ))}
    </div>
  );
}
