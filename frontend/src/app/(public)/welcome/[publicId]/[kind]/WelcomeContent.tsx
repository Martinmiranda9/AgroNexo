'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import BrandMark from '@/ui/components/BrandMark';

export interface WelcomeContentProps {
  firstName?: string;
  publicId: string;
  roleLabel: string;
}

export default function WelcomeContent({ firstName, publicId, roleLabel }: WelcomeContentProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#fef7e5] px-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          {/* Ícono animado */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className="relative mb-8"
          >
            {/* Anillo exterior */}
            <div className="absolute inset-0 animate-ping rounded-full bg-[#00311e]/15" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#00311e] shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-[#fef7e5]" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h1 className="text-heading-lg text-[#00311e] sm:text-heading-xl">
              ¡Bienvenido a{' '}
              <span className="text-[#4D694E]">Agro</span>
              <span className="text-[#00311e]">Nexo</span>
              !
            </h1>
            <p className="mt-3 text-body-lg text-primary">
              {firstName && (
                <>
                  Hola, <strong className="font-semibold text-[#00311e]">{firstName}</strong>.{' '}
                </>
              )}
              Tu cuenta fue creada exitosamente.
            </p>
          </motion.div>

          {/* Card de confirmación */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mt-8 w-full rounded-[16px] border border-[#00311e]/12 bg-white px-6 py-5"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <BrandMark variant="light" className="h-5 w-5 flex-shrink-0" />
                <p className="text-body-sm text-[#00311e]">
                  Tu perfil de <strong>{roleLabel}</strong> está listo
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 flex-shrink-0 rounded-full bg-[#00311e]/10 flex items-center justify-center">
                  <span className="text-caption font-bold text-[#00311e]">#</span>
                </div>
                <p className="text-body-sm text-primary">
                  ID público:{' '}
                  <span className="font-mono font-semibold text-[#00311e]">{publicId}</span>
                </p>
              </div>
              <div className="mt-1 h-px bg-[#00311e]/10" />
              <p className="text-caption text-primary">
                Podés completar tu perfil, agregar tus campos y conectarte con profesionales desde tu
                dashboard.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8 flex w-full flex-col gap-3"
          >
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard">
                Ir a mi dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login" className="text-primary">
                Iniciar sesión más tarde
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
