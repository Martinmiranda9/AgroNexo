'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/** Una figura escrita con la skill hairline-create: lo que exporta su archivo `*.figure.js`. */
export type HairlineFigureDef = {
  name: string;
  means: string;
  range: number[]; // [en 0, en 0.5, en 1]
  tour: (number[] | null)[] | null;
  mount: (
    host: { stage: HTMLElement; svg: SVGSVGElement; read: { textContent: string } },
    value: number,
  ) => { set: (value: number) => void; destroy: () => void };
};

type Props = {
  /** Carga perezosa de la figura: el motor toca el DOM, así que no se importa en el servidor. */
  load: () => Promise<{ default: HairlineFigureDef }>;
  /** 0 (sutil) a 1 (fuerte), como el `intensity` del paquete. */
  intensity?: number;
  /** Recorre la figura sola hasta que llega el puntero, y retoma cuando se va. */
  play?: boolean;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/** Intensidad → el número propio de la figura: dos rectas que se cruzan en 0.5, como en el bench de Hairline. */
function valueAt([lo, mid, hi]: number[], i: number) {
  const t = Math.min(1, Math.max(0, i));
  return t <= 0.5 ? lo + (t / 0.5) * (mid - lo) : mid + ((t - 0.5) / 0.5) * (hi - mid);
}

/**
 * Monta una figura Hairline propia, igual que los componentes de `@lucasmarkes/hairline/react`: una caja 5:4
 * que en el servidor queda vacía (no hay salto de layout) y se dibuja al montar.
 */
export default function HairlineFigure({ load, intensity = 0.5, play = false, label, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    let cancelled = false;
    let cleanup = () => {};

    Promise.all([load(), import('./kernel')]).then(([{ default: figure }, { default: HL }]) => {
      if (cancelled) return;
      HL.inject(document);
      stage.setAttribute('data-hairline', figure.name);
      const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage) as SVGSVGElement;
      const handle = figure.mount({ stage, svg, read: { textContent: '' } }, valueAt(figure.range, intensity));
      const walk = play ? HL.tour(stage, figure.tour ?? HL.LAP) : null;
      cleanup = () => {
        walk?.stop();
        handle.destroy();
        svg.remove();
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [load, intensity, play]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={className}
      style={{ position: 'relative', aspectRatio: '5 / 4', touchAction: 'pan-y', userSelect: 'none', ...style }}
    />
  );
}
