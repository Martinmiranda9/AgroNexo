'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Plant } from '@phosphor-icons/react';

const WHEEL_WORDS = ['ingenieros.', 'inversores.', 'contadores.', 'especialistas.'];

export default function OnboardingHeroPanel() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % WHEEL_WORDS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  return (
    <div className="relative flex h-full w-full flex-col bg-[#24301E]">
      
      {/* Brand */}
      <div className="relative z-10 mb-10 flex items-center gap-2 p-6 md:mb-16 md:p-12">
        <Plant weight="fill" size={20} className="text-[#99A474]" aria-hidden="true" />
        <span className="text-base font-semibold tracking-tight text-white/90">
          AgroConnect
        </span>
      </div>

      {/* Tipografía central */}
      <div className="relative z-10 flex flex-1 flex-col px-6 md:px-12">
        <h1 className="text-[2.75rem] font-medium leading-none tracking-tighter text-white md:text-[4rem] lg:text-[4.5rem]">
          Conecta con
        </h1>

        {/* 
          BUG FIX: Altura explícita en píxeles/rems según breakpoint, 
          evitando `1lh` que rompe en algunos motores de renderizado.
        */}
        <div
          className="relative h-[3.5rem] overflow-hidden md:h-[5rem] lg:h-[5.5rem]"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={WHEEL_WORDS[index]}
              initial={shouldReduceMotion ? false : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { y: -40, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 text-[2.75rem] font-medium leading-none tracking-tighter text-[#99A474] md:text-[4rem] lg:text-[4.5rem]"
            >
              {WHEEL_WORDS[index]}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-6 max-w-[30ch] text-[15px] leading-relaxed text-white/45 md:mt-8">
          La red profesional del campo argentino. Espacio de trabajo compartido para productores y sus equipos.
        </p>

        {/* Dots arreglados (flex-shrink-0 para evitar que se deformen) */}
        <div className="mt-8 flex items-center gap-2" role="group">
          {WHEEL_WORDS.map((word, i) => (
            <button
              key={word}
              onClick={() => setIndex(i)}
              aria-label={`Ver ${word}`}
              className="h-1.5 shrink-0 rounded-full transition-all duration-300"
              style={{
                width: i === index ? '24px' : '6px',
                backgroundColor: i === index ? '#99A474' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Background radial sutil para dar profundidad (Taste Skill premium) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(153, 164, 116, 0.15) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Noise */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '160px',
        }}
      />
    </div>
  );
}
