'use client';

import { useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';

const SCENE_URL = 'https://prod.spline.design/TdfSmyFwLL7301ct/scene.splinecode';
const HIDDEN_OBJECTS = ['CTA container', 'Tittle', 'Body'];
const DESKTOP_QUERY = '(min-width: 768px)';

// Difumina los bordes y, además, se apaga hacia abajo para no pisar el texto del pilar.
const FEATHER_MASK =
  'radial-gradient(closest-side, #000 64%, transparent 100%), linear-gradient(to bottom, #000 64%, transparent 86%)';

/**
 * Escena de Spline recoloreada con la paleta AgroNexo sobre el fondo del contenedor.
 * El canvas (naranja sobre negro) pasa por un mapa de gradiente y se mezcla con `screen`:
 * el negro desaparece, las franjas tenues se funden con el Pine y las intensas quedan beige.
 */
export default function SplineBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let starting = false;
    let visible = false;
    let app: Application | undefined;

    const start = async () => {
      starting = true;
      const { Application } = await import('@splinetool/runtime');
      if (disposed) return;
      const instance = new Application(canvas);
      await instance.load(SCENE_URL);
      if (disposed) {
        instance.dispose();
        return;
      }
      instance.getAllObjects().forEach((obj) => {
        if (HIDDEN_OBJECTS.includes(obj.name)) obj.visible = false;
      });
      app = instance;
      if (!visible) instance.stop();
      setReady(true);
    };

    // El panel es `hidden` bajo md: con el canvas en 0×0 el renderer WebGPU tira errores en bucle.
    // Solo se descarga la escena cuando el panel se ve, y se pausa cuando deja de verse.
    const media = window.matchMedia(DESKTOP_QUERY);
    const sync = () => {
      const next = media.matches && canvas.clientWidth > 0 && canvas.clientHeight > 0;
      if (next === visible) return;
      visible = next;
      if (next && !app && !starting) start().catch(() => {});
      else if (next) app?.play();
      else app?.stop();
    };

    const observer = new ResizeObserver(sync);
    observer.observe(canvas);
    media.addEventListener('change', sync);
    sync();

    return () => {
      disposed = true;
      observer.disconnect();
      media.removeEventListener('change', sync);
      app?.dispose();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 isolate mix-blend-screen"
      style={{
        maskImage: FEATHER_MASK,
        WebkitMaskImage: FEATHER_MASK,
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
      }}
    >
      {/* Mapa de gradiente: luminancia → Pine · bosque · salvia · beige. Lo oscuro se pierde en el fondo. */}
      <svg width="0" height="0" className="absolute" focusable="false">
        <filter id="agro-gradient-map" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.31 1.03 0.1 0 0  0.31 1.03 0.1 0 0  0.31 1.03 0.1 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0 0.03 0.12 0.36 0.62 0.85 0.996" />
            <feFuncG type="table" tableValues="0 0 0.1 0.28 0.5 0.7 0.86 0.97" />
            <feFuncB type="table" tableValues="0 0 0.05 0.16 0.34 0.52 0.7 0.9" />
          </feComponentTransfer>
        </filter>
      </svg>
      <canvas
        ref={canvasRef}
        // La escena trae las franjas descentradas hacia la derecha: se compensa para centrarlas en el panel.
        style={{ filter: 'url(#agro-gradient-map)', translate: '-15% -2%' }}
        className={`agro-drift h-full w-full transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
