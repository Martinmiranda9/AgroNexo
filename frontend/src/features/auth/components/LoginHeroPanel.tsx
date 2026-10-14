'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { MdOutlineEco, MdOutlineLock, MdOutlineShield, MdTrendingUp } from 'react-icons/md';

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=90&fit=crop&auto=format';

// ─── Badge superior (status) ──────────────────────────────────────────────────
interface StatusBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  delay?: number;
}

function StatusBadge({ children, icon, delay = 0 }: StatusBadgeProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="
        inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 
        border border-white/20 bg-white/10 backdrop-blur-md
        text-caption font-medium tracking-wide text-white/90
     "
    >
      {icon}
      {children}
    </motion.div>
  );
}

// ─── Feature Card Inferior ───────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay?: number;
}

function FeatureCard({ icon, title, desc, delay = 0 }: FeatureCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="
        flex flex-col gap-2 rounded-xl border border-white/10 
        bg-white/5 p-4 backdrop-blur-md transition-colors 
        hover:bg-white/10
     "
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-white/10 text-white">
        {icon}
      </div>
      <div className="mt-1">
        <h4 className="text-body-sm font-semibold text-white/95">{title}</h4>
        <p className="mt-1 text-caption text-white/60">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Hero Panel Dark Enterprise ───────────────────────────────────────────────
export default function LoginHeroPanel() {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex h-full w-full flex-col justify-between p-8 xl:p-12">
      {/* ── Background Image & Overlays ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={HERO_IMAGE_URL}
          alt="Campo agrícola argentino al atardecer"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {/* Dark overlay: bottom is very dark (#0E3823 -> black), top is semi-dark */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#0E3823]/60 to-black/20" />
      </div>

      {/* ── Top Status Badges ── */}
      <div className="relative z-10 flex w-full items-center justify-between">
        <StatusBadge 
          delay={0.1}
          icon={<MdOutlineShield className="h-3.5 w-3.5 opacity-80" />}
        >
          Tecnología de Campo Verificada
        </StatusBadge>
        
        <StatusBadge 
          delay={0.2}
          icon={<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        >
          Sensores activos en línea
        </StatusBadge>
      </div>

      {/* ── Middle Editorial Headline ── */}
      <div className="relative z-10 w-full max-w-[420px] self-start py-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 h-0.5 w-12 bg-emerald-500/80 origin-left"
        />
        
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-0 text-heading-xl tracking-heading text-white"
        >
          <span>Cultivando un</span>
          <span className="font-normal text-emerald-100">mejor mañana</span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 text-body-sm text-white/70 max-w-[380px]"
        >
          Soluciones de precisión para el agro moderno. Gestioná, monitoreá y
          maximizá tu rendimiento con tecnología confiable.
        </motion.p>
      </div>

      {/* ── Bottom Feature Cards ── */}
      <div className="relative z-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <FeatureCard
          delay={0.4}
          icon={<MdOutlineLock size={14} />}
          title="Agricultura Inteligente"
          desc="Decisiones claras basadas en datos de suelo y clima."
        />
        <FeatureCard
          delay={0.5}
          icon={<MdOutlineEco size={14} />}
          title="Salud del Cultivo"
          desc="Monitoreo satelital y detección temprana de plagas."
        />
        <FeatureCard
          delay={0.6}
          icon={<MdTrendingUp size={14} />}
          title="Mayor Rendimiento"
          desc="Sustentabilidad y máxima eficiencia por hectárea."
        />
      </div>
    </div>
  );
}
