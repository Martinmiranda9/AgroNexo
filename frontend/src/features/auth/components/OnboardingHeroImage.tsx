'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout } from 'lucide-react';

const ROLES = ['productores', 'ingenieros', 'contadores', 'inversores'];

export default function OnboardingHeroImage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROLES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Para el efecto de "slot machine" sin saltos raros,
  // la palabra superior de la iteración actual es la palabra que antes estaba en el medio.
  // La palabra inferior es la que vendrá en el siguiente paso.
  const prevWord = ROLES[(index - 1 + ROLES.length) % ROLES.length];
  const currentWord = ROLES[index];
  const nextWord = ROLES[(index + 1) % ROLES.length];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      {/* Imagen de fondo */}
      <Image
        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85&fit=crop"
        alt="Campo agrícola"
        fill
        className="object-cover object-center"
        priority
        sizes="45vw"
      />
      {/* Overlay oscuro sutil */}
      <div className="absolute inset-0 bg-[#24301E]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#24301E]/80 via-transparent to-transparent" />

      {/* Logo superior */}
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-sm backdrop-blur-md">
          <Sprout className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white drop-shadow-md">
          Agro<span className="text-[#99A474]">Connect</span>
        </span>
      </div>

      {/* Texto central (Kinetic Typography) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h2 className="mb-4 text-3xl font-bold leading-none text-white drop-shadow-lg sm:text-4xl">
          Conecta con
        </h2>
        
        {/* Contenedor estricto para recortar y alinear la ruleta */}
        <div className="relative h-[220px] w-full overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={index}
              // El bloque entero sube 70px (aproximadamente la distancia entre palabras)
              initial={{ y: 70, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -70, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 flex flex-col items-center justify-center gap-4"
            >
              {/* Renglón de arriba (desenfocado) */}
              <div className="text-2xl font-bold text-[#99A474]/60 blur-[3px] transition-all">
                {prevWord}
              </div>
              
              {/* Renglón del medio (nítido) */}
              <div className="text-5xl font-extrabold text-[#FFF3D5] drop-shadow-lg transition-all">
                {currentWord}
              </div>
              
              {/* Renglón de abajo (desenfocado) */}
              <div className="text-2xl font-bold text-[#99A474]/60 blur-[3px] transition-all">
                {nextWord}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
