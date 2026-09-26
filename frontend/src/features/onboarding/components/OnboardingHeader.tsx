import { BrandLogo, StepProgress } from '@/ui/components';

interface OnboardingHeaderProps {
  /** Índice (base 0) del paso actual. */
  current: number;
  total: number;
}

/** Encabezado fijo de todos los pasos: marca, contador y barra de progreso. Lo único que cambia debajo es el contenido. */
export default function OnboardingHeader({ current, total }: OnboardingHeaderProps) {
  return (
    <header>
      <div className="flex items-center justify-between">
        <BrandLogo />
        <span aria-hidden className="font-mono text-caption tabular-nums text-primary">
          Paso {Math.min(current + 1, total)} de {total}
        </span>
      </div>
      <div className="mt-5">
        <StepProgress total={total} current={current} />
      </div>
    </header>
  );
}
