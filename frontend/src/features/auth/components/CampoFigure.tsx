'use client';

import type { CSSProperties } from 'react';
import HairlineFigure from '@/ui/components/hairline/HairlineFigure';

const loadCampo = () => import('./campo.figure');

/** El hub del login con un tractor y un camión en los extremos (figura propia de Hairline). */
export default function CampoFigure({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <HairlineFigure
      load={loadCampo}
      play
      intensity={0.6}
      label="Un nodo central con lotes a su alrededor, un tractor y un camión: productores y profesionales en red"
      className={className}
      style={style}
    />
  );
}
