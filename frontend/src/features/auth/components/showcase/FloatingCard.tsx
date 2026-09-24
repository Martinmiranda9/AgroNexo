'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

export type ShowcaseState = 'hot' | 'idle' | 'dim';

interface FloatingCardProps {
  children: ReactNode;
  state: ShowcaseState;
  /** Posición y ancho dentro de la composición (px). */
  left: number;
  top: number;
  width: number;
  rotate: number;
  /** Retraso de la entrada (s). */
  delay: number;
  /** Duración de un ciclo de vaivén (s). */
  floatSeconds: number;
}

/**
 * Envoltorio de una card flotante: entrada escalonada, vaivén continuo y énfasis según el pilar activo.
 * El énfasis atenúa con una capa Pine en vez de `filter`, para no romper el `backdrop-blur` del bisel de la Card.
 */
export default function FloatingCard({ children, state, left, top, width, rotate, delay, floatSeconds }: FloatingCardProps) {
  const reduce = useReducedMotion();

  return (
    <div className="absolute" style={{ left, top, width }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0, scale: state === 'hot' ? 1.04 : 1 }}
        transition={{
          default: { duration: 0.7, ease: EASE },
          opacity: { duration: 0.8, delay, ease: EASE },
          y: { duration: 0.9, delay, ease: EASE },
        }}
        style={{ rotate }}
        className="relative"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: floatSeconds, repeat: Infinity, ease: 'easeInOut' }}
        >
          {children}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ opacity: state === 'dim' ? 0.12 : 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="pointer-events-none absolute inset-0 rounded-[22px] bg-pine"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
