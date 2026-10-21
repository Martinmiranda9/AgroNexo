import BrandLogo from '@/ui/components/BrandLogo';
import { Progress } from '@/ui/components/Progress';

interface OnboardingHeaderProps {
  /** Índice (base 0) del paso actual. */
  current: number;
  total: number;
}

/**
 * Encabezado fijo de todos los pasos: marca, contador y barra de progreso. Lo único que cambia debajo es el contenido.
 * La barra es un `Progress` thin de Cashmere por paso: el actual y los anteriores se pintan de verde al continuar.
 */
export default function OnboardingHeader({ current, total }: OnboardingHeaderProps) {
  const step = Math.min(current + 1, total);

  return (
    <header>
      <div className="flex items-center justify-between">
        <BrandLogo />
        <span aria-hidden className="text-body-sm text-muted-foreground font-mono tabular-nums">
          Paso {step} de {total}
        </span>
      </div>
      <div
        className="mt-5 flex gap-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={`Paso ${step} de ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <Progress
            key={i}
            size="thin"
            value={i <= current ? 100 : 0}
            aria-hidden
            data-step-state={i < current ? 'completed' : i === current ? 'current' : 'upcoming'}
            className="flex-1"
          />
        ))}
      </div>
    </header>
  );
}
