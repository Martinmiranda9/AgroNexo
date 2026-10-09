import type { CSSProperties } from 'react';
import { Badge, BadgeDot } from '@/ui/components';
import CampoFigure from './CampoFigure';

// Paleta de líneas de Hairline sobre Pine. `--hairline-plate` tiene que ser el fondo exacto: las placas
// van rellenas para tapar lo que queda detrás.
const HAIRLINE_THEME = {
  '--hairline-plate': 'var(--color-pine)',
  '--hairline-hi': 'var(--color-beige)',
  '--hairline-edge': 'color-mix(in oklab, var(--color-beige) 62%, var(--color-pine))',
  '--hairline-mid': 'color-mix(in oklab, var(--color-accent-light) 55%, var(--color-pine))',
  '--hairline-lo': 'color-mix(in oklab, var(--color-beige) 16%, var(--color-pine))',
  '--hairline-stroke': '1',
} as CSSProperties;

/**
 * Panel de marca (solo desktop): figura isométrica de Hairline — un hub con sus lotes, un tractor y un
 * camión, que responde al puntero — y la propuesta de valor. El formulario vive en el lado izquierdo, esto es decorativo.
 */
export default function BrandShowcasePanel() {
  return (
    <section className="relative isolate hidden flex-col overflow-hidden rounded-l-[2.5rem] bg-pine px-10 pb-12 pt-10 text-beige md:flex md:w-[54%] xl:rounded-l-[3.5rem] xl:px-14 xl:pb-14 xl:pt-12">
      {/* Retícula de puntos muy tenue + glow salvia arriba: da profundidad sin competir con las líneas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(var(--color-beige)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-accent-light/20 blur-3xl"
      />

      <div className="relative z-10">
        <Badge variant="inverse" className="h-auto gap-1.5 px-3.5 py-1.5 text-caption font-medium tracking-wide">
          <BadgeDot className="animate-pulse bg-accent-light motion-reduce:animate-none" />
          Campaña 25/26
        </Badge>
      </div>

      {/* La figura llena el ancho a 5:4; se limita por alto para que nunca empuje el titular fuera del panel */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center py-6">
        <div className="aspect-[5/4] h-full max-h-[540px] max-w-full">
          <CampoFigure style={HAIRLINE_THEME} className="h-full w-full" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
        <h2 className="text-heading-md tracking-heading xl:text-heading-lg">Tu campo, conectado.</h2>
        <p className="mt-3 max-w-sm text-body-sm text-beige/70">
          Productores, agrónomos y contadores en una misma red. Encontrá al profesional que tu lote necesita.
        </p>
      </div>
    </section>
  );
}
