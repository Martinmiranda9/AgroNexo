'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRightIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle, Button } from '@/ui/components';
import BrandMark from '@/ui/components/BrandMark';

export interface WelcomeContentProps {
  firstName?: string;
  publicId: string;
  roleLabel: string;
}

export default function WelcomeContent({ firstName, publicId, roleLabel }: WelcomeContentProps) {
  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-beige px-6">
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
            <div aria-hidden className="absolute inset-0 rounded-full bg-pine/15 motion-safe:animate-ping" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-pine">
              <CheckCircleIcon size={40} weight="regular" className="text-beige" aria-hidden />
            </div>
          </motion.div>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h1 className="text-heading-lg text-pine sm:text-heading-xl">
              ¡Bienvenido a{' '}
              <span className="text-olive">Agro</span>
              <span className="text-pine">Nexo</span>
              !
            </h1>
            <p className="mt-3 text-body-lg text-olive">
              {firstName && (
                <>
                  Hola, <strong className="font-semibold text-pine">{firstName}</strong>.{' '}
                </>
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className="mt-6 w-full"
          >
            <Alert variant="success">
              <CheckCircleIcon />
              <AlertTitle>Cuenta creada con éxito</AlertTitle>
              <AlertDescription>Entrá a tu panel para empezar a conectarte con profesionales.</AlertDescription>
            </Alert>
          </motion.div>

          {/* Card de confirmación */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mt-8 w-full rounded-card border border-pine/12 bg-bg-card px-6 py-5"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <BrandMark variant="light" className="h-5 w-5 flex-shrink-0" />
                <p className="text-body-sm text-pine">
                  Tu perfil de <strong>{roleLabel}</strong> está listo
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 flex-shrink-0 rounded-full bg-pine/10 flex items-center justify-center">
                  <span className="text-caption font-bold text-pine">#</span>
                </div>
                <p className="text-body-sm text-olive">
                  ID público:{' '}
                  <span className="font-mono font-semibold text-pine">{publicId}</span>
                </p>
              </div>
              <div className="mt-1 h-px bg-pine/10" />
              <p className="text-body-sm text-olive">
                Podés completar tu perfil, agregar tus campos y conectarte con profesionales desde tu
                panel.
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
            <Button render={<Link href="/dashboard" />} nativeButton={false} size="lg" className="w-full">
              Ir a mi panel
              <ArrowRightIcon data-icon="inline-end" size={16} weight="bold" aria-hidden />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
