import { cn } from '@/shared/utils/cn';

interface BrandGlowProps {
  /** Más tenue, para pantallas de trabajo (resultados) donde el contenido manda. */
  quiet?: boolean;
  className?: string;
}

// Los colores salen de los tokens de la paleta: si cambia la marca, el brillo cambia con ella.
const GLOW = [
  'radial-gradient(520px 380px at 84% 18%, color-mix(in oklab, var(--color-accent-light) 30%, transparent), transparent 70%)',
  'radial-gradient(460px 340px at 12% 30%, color-mix(in oklab, var(--color-bg-hero) 95%, transparent), transparent 72%)',
  'radial-gradient(620px 300px at 55% 0%, color-mix(in oklab, var(--color-accent-mid) 14%, transparent), transparent 70%)',
].join(', ');

// Ruido fino: rompe el "banding" de los degradados suaves y le da textura de papel al fondo.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Brillo de marca para el fondo casi blanco (`bg-paper`): salvia arriba a la derecha y un tono cálido a la izquierda,
 * con una deriva lenta (`agro-drift`, la misma del login; se detiene con `prefers-reduced-motion`) y un grano tenue.
 * Va `fixed` y sin eventos (regla 8 del plan), detrás del contenido.
 */
export default function BrandGlow({ quiet = false, className }: BrandGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-0 h-[760px] overflow-hidden [mask-image:linear-gradient(black_55%,transparent)] transition-opacity duration-500',
        quiet && 'opacity-45',
        className
      )}
    >
      <div
        className="agro-drift absolute -inset-[6%] will-change-transform"
        style={{ backgroundImage: GLOW }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
