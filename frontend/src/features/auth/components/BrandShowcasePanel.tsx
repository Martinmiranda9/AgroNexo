'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { Pause, Play } from '@phosphor-icons/react';
import { Badge } from '@/ui/components';
import BrandGradient from '@/ui/components/BrandGradient';
import { FieldMapCard, FloatingCard, MatchCard, YieldCard, type ShowcaseState } from './showcase';

const SLIDE_MS = 6000;

// Cada pilar resalta su card: [0] mapa · [1] match · [2] rinde.
const BRAND_SLIDES = [
  {
    title: 'Trazabilidad de campo',
    description: 'Registrá labores, insumos y rindes por lote, todo en un mismo lugar.',
  },
  {
    title: 'Match con profesionales',
    description: 'Conectá tu establecimiento con agrónomos, contadores e inversores verificados.',
  },
  {
    title: 'Decisiones con datos',
    description: 'Visualizá el estado de tus campos y actuá con información real, no supuestos.',
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

// Tamaño de diseño de la composición; se escala para entrar en el panel a cualquier ancho/alto.
const COMP_W = 600;
const COMP_H = 410;

/** Capa con parallax: las más cercanas (depth alto) se mueven más que las lejanas. */
function Layer({ depth, px, py, children }: { depth: number; px: MotionValue<number>; py: MotionValue<number>; children: ReactNode }) {
  const x = useTransform(px, (v) => v * -depth * 2);
  const y = useTransform(py, (v) => v * -depth * 2);
  return (
    <motion.div style={{ x, y }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

/**
 * Panel de marca (solo desktop): gradiente de marca sobre Pine y una maqueta de la UI del producto
 * armada con componentes del UI Kit.
 */
export default function BrandShowcasePanel() {
  const [active, setActive] = useState(0);
  const [scale, setScale] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 70, damping: 18 });
  const py = useSpring(my, { stiffness: 70, damping: 18 });

  // `active` en deps: al elegir un pilar a mano se reinicia el ciclo. No rota con prefers-reduced-motion
  // ni mientras el usuario pausa, apunta con el mouse o tiene el foco en el panel (WCAG 2.2.2).
  useEffect(() => {
    if (reduce || paused || hovering || focused) return;
    const timer = setTimeout(() => setActive((p) => (p + 1) % BRAND_SLIDES.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [active, reduce, paused, hovering, focused]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setScale(Math.max(0.5, Math.min(width / COMP_W, height / COMP_H, 1.2)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handlePointerLeave = () => {
    mx.set(0);
    my.set(0);
    setHovering(false);
  };

  const slide = BRAND_SLIDES[active];
  const stateOf = (i: number): ShowcaseState => (i === active ? 'hot' : 'dim');

  return (
    <section
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={handlePointerLeave}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="relative isolate hidden flex-col overflow-hidden rounded-l-[2.5rem] bg-pine px-10 pb-12 pt-10 text-beige md:flex md:w-[54%] xl:rounded-l-[3.5rem] xl:px-14 xl:pb-14 xl:pt-12"
    >
      <BrandGradient className="-z-20" />
      {/* Velo inferior: asegura el contraste del texto del pilar sobre el gradiente */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-pine/80 via-pine/0 to-pine/0" />

      <div className="relative z-10">
        <Badge variant="inverse" dot className="px-3.5 py-1.5 text-caption font-medium tracking-wide">
          Campaña 25/26
        </Badge>
      </div>

      {/* Composición decorativa: cards del producto flotando con parallax */}
      <div ref={stageRef} aria-hidden="true" className="relative min-h-0 flex-1">
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: COMP_W, height: COMP_H, transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <Layer depth={10} px={px} py={py}>
            <FloatingCard state={stateOf(0)} left={40} top={0} width={400} rotate={-2} delay={0.3} floatSeconds={7}>
              <FieldMapCard />
            </FloatingCard>
          </Layer>
          <Layer depth={18} px={px} py={py}>
            <FloatingCard state={stateOf(2)} left={0} top={248} width={236} rotate={-3} delay={0.8} floatSeconds={8}>
              <YieldCard />
            </FloatingCard>
          </Layer>
          <Layer depth={28} px={px} py={py}>
            <FloatingCard state={stateOf(1)} left={326} top={206} width={274} rotate={2.5} delay={0.55} floatSeconds={6}>
              <MatchCard />
            </FloatingCard>
          </Layer>
        </div>
      </div>

      {/* Pilar de valor — centrado al pie */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="min-h-[112px] max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <h2 className="text-heading-md tracking-heading xl:text-heading-lg">{slide.title}</h2>
              <p className="mx-auto mt-3 max-w-sm text-body-sm text-beige/70">{slide.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Paginador: píldora activa + puntos */}
        <div className="mt-6 flex items-center gap-1.5">
          {BRAND_SLIDES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ir a pilar ${i + 1}: ${s.title}`}
              aria-current={i === active}
              className="group cursor-pointer p-1 focus-visible:outline-none"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-beige group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-pine ${
                  i === active ? 'w-6 bg-beige' : 'w-1.5 bg-beige/60 group-hover:bg-beige/80'
                }`}
              />
            </button>
          ))}
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Reanudar rotación automática' : 'Pausar rotación automática'}
              className="ml-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-beige/80 transition-colors hover:text-beige focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beige"
            >
              {paused ? <Play size={14} weight="fill" aria-hidden /> : <Pause size={14} weight="fill" aria-hidden />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
