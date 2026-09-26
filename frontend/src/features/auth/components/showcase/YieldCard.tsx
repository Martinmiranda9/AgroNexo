'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Plant, TrendUp } from '@phosphor-icons/react';
import { Badge, Card } from '@/ui/components';
import IconContainer from '@/ui/components/IconContainer';
import { cn } from '@/shared/utils/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Altura relativa de cada campaña; la última es la actual. */
const YIELD_BARS = [38, 52, 46, 64, 58, 76, 92];

/** Rinde estimado vs. campañas anteriores. Datos de ejemplo. */
export default function YieldCard() {
  const reduce = useReducedMotion();

  return (
    <Card surface="onDark" coreClassName="px-4 pb-3.5 pt-3.5" className="shadow-2xl shadow-pine/40">
      <div className="flex items-center gap-2.5">
        <IconContainer size="sm">
          <Plant size={15} weight="regular" />
        </IconContainer>
        <div>
          <p className="text-body-sm font-semibold tracking-heading">Rinde estimado</p>
          <p className="mt-0.5 text-caption text-dark/70">Soja · vs. campaña anterior</p>
        </div>
      </div>

      <div className="mb-3 mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-heading-lg font-medium tabular-nums leading-none">3,9</span>
        <span className="font-mono text-caption text-dark/70">t/ha</span>
        <Badge variant="positive" icon={<TrendUp size={12} weight="bold" />} className="ml-auto">
          <span className="font-mono tabular-nums">6%</span>
        </Badge>
      </div>

      <div className="flex h-12 items-end gap-1.5">
        {YIELD_BARS.map((height, i) => (
          <motion.i
            key={i}
            initial={reduce ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.1, delay: 1.1 + i * 0.05, ease: EASE }}
            style={{ height: `${height}%`, originY: 1 }}
            className={cn(
              'flex-1 rounded-t-[5px] rounded-b-[2px]',
              i === YIELD_BARS.length - 1 ? 'bg-pine' : 'bg-accent-light/60',
            )}
          />
        ))}
      </div>
    </Card>
  );
}
