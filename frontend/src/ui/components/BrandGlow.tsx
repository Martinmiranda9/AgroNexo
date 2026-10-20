import { cn } from '@/shared/utils/cn';

interface BrandGlowProps {
  /** Más tenue, para pantallas de trabajo (resultados) donde el contenido manda. */
  quiet?: boolean;
  className?: string;
}

// Los colores salen de los tokens de la paleta: si cambia la marca, el brillo cambia con ella. Como un atardecer en
// verde: arriba a la izquierda casi blanco, un velo de verde campo arriba al centro y un brillo marcado abajo a la
// derecha, sobre una base que va de salvia clara a verde campo 50.
const GLOW = [
  'radial-gradient(70% 75% at 100% 100%, color-mix(in oklab, var(--color-field-300) 70%, transparent), transparent 70%)',
  'radial-gradient(45% 50% at 85% 90%, color-mix(in oklab, var(--color-field-200) 80%, transparent), transparent 75%)',
  'radial-gradient(55% 35% at 55% 0%, color-mix(in oklab, var(--color-field-100) 90%, transparent), transparent 75%)',
  'radial-gradient(50% 50% at 0% 0%, var(--color-sage-25), transparent 80%)',
  'linear-gradient(135deg, var(--color-sage-50) 0%, var(--color-field-50) 60%, var(--color-field-100) 100%)',
].join(', ');

// Ruido fino: rompe el "banding" de los degradados suaves y le da textura de papel al fondo.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Brillo de marca sobre el lienzo: claro arriba a la izquierda y verde campo abajo a la derecha, con una deriva lenta
 * (`agro-drift`, la misma del login; se detiene con `prefers-reduced-motion`) y un grano tenue. Va `fixed`, a toda la
 * pantalla y sin eventos (plan de frontend: grain solo en elementos fixed), detrás del contenido.
 */
export default function BrandGlow({ quiet = false, className }: BrandGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-500',
        quiet && 'opacity-45',
        className
      )}
    >
      <div
        className="agro-drift absolute -inset-[6%] will-change-transform"
        style={{ backgroundImage: GLOW }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
