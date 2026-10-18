'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { PreviewData } from '../config/types';
import ProfilePreviewCard from './ProfilePreviewCard';

interface PreviewPanelProps {
  data: PreviewData;
  stepKey: string;
  caption: string;
}

/** Panel derecho (solo desktop): fondo Pine con la card de perfil y un texto por paso. */
export default function PreviewPanel({ data, stepKey, caption }: PreviewPanelProps) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-hidden
      className="bg-pine relative hidden flex-col items-center overflow-hidden rounded-l-[2.5rem] px-12 pt-12 pb-12 md:flex md:w-[54%] xl:rounded-l-[3.5rem] xl:px-16 xl:pb-14"
    >
      <div className="from-sage-50/10 pointer-events-none absolute inset-0 bg-radial-[at_50%_45%] to-transparent to-60%" />

      <div className="relative flex flex-1 items-center">
        <ProfilePreviewCard data={data} />
      </div>

      <div className="relative min-h-[64px] max-w-sm text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepKey}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-body-sm text-sage-50/60"
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
