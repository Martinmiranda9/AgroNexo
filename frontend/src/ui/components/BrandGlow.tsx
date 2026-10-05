import { cn } from '@/shared/utils/cn';

interface BrandGlowProps {
  /** Más tenue, para pantallas de trabajo (resultados) donde el contenido manda. */
  quiet?: boolean;
  className?: string;
}

// Los colores salen de los tokens de la paleta: si cambia la marca, el brillo cambia con ella.
const GLOW = [
  'radial-gradient(520px 380px at 84% 18%, color-mix(in oklab, var(--color-accent-light) 42%, transparent), transparent 70%)',
  'radial-gradient(460px 340px at 12% 30%, color-mix(in oklab, var(--color-bg-hero) 95%, transparent), transparent 72%)',
  'radial-gradient(620px 300px at 55% 0%, color-mix(in oklab, var(--color-accent-mid) 14%, transparent), transparent 70%)',
].join(', ');

/**
 * Brillo de marca para el fondo casi blanco (`bg-paper`): salvia arriba a la derecha y un tono cálido a la izquierda.
 * Va `fixed` y sin eventos (regla 8 del plan), detrás del contenido.
 */
export default function BrandGlow({ quiet = false, className }: BrandGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-0 h-[760px] [mask-image:linear-gradient(black_55%,transparent)] transition-opacity duration-500',
        quiet && 'opacity-45',
        className
      )}
      style={{ backgroundImage: GLOW }}
    />
  );
}
