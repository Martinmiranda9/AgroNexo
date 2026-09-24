import { motion, useReducedMotion } from 'motion/react';

interface StepProgressProps {
  total: number;
  /** Índice (base 0) del paso actual; ese segmento y los anteriores se muestran completos. */
  current: number;
}

/** Barra de progreso segmentada: un segmento por paso. */
export default function StepProgress({ total, current }: StepProgressProps) {
  const reduce = useReducedMotion();
  const step = Math.min(current + 1, total);

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-label={`Paso ${step} de ${total}`}
      className="flex gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-pine/10">
          <motion.div
            className="h-full origin-left rounded-full bg-pine"
            initial={false}
            animate={{ scaleX: i <= current ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      ))}
    </div>
  );
}
