'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import Grainient from './Grainient';

// [claro, medio, oscuro]: el shader mezcla estos tres. Se leen de los tokens en runtime
// para no duplicar hex acá: si cambia la paleta, el gradiente cambia con ella.
const TOKENS = ['--accent-mid', '--primary', '--pine'] as const;

/**
 * Fondo animado con la paleta de marca (Pine → Oliva → Salvia) y grano fino.
 * Ocupa todo el contenedor posicionado que lo contiene.
 */
export default function BrandGradient({ className = '' }: { className?: string }) {
  const [colors, setColors] = useState<string[] | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors(TOKENS.map((token) => style.getPropertyValue(token).trim()));
  }, []);

  if (!colors) return null;

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`.trim()}>
      <Grainient
        color1={colors[0]}
        color2={colors[1]}
        color3={colors[2]}
        timeSpeed={reduce ? 0 : 0.18}
        warpStrength={1}
        warpFrequency={4}
        warpSpeed={1.2}
        warpAmplitude={60}
        blendSoftness={0.35}
        rotationAmount={420}
        noiseScale={1.6}
        grainAmount={0.06}
        contrast={1.25}
        saturation={0.9}
        zoom={1}
      />
    </div>
  );
}
