'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { MdArrowForward, MdOutlineCheckCircle } from 'react-icons/md';
import { Alert, AlertDescription, AlertTitle, Button, Card, Separator } from '@/ui/components';
import BrandMark from '@/ui/components/BrandMark';

export interface WelcomeContentProps {
  firstName?: string;
  publicId: string;
  roleLabel: string;
}

export default function WelcomeContent({ firstName, publicId, roleLabel }: WelcomeContentProps) {
  return (
    <main className="bg-sage-50 flex min-h-[100dvh] w-full items-center justify-center px-6">
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
            <div
              aria-hidden
              className="bg-pine/15 absolute inset-0 rounded-full motion-safe:animate-ping"
            />
            <div className="bg-pine relative flex h-24 w-24 items-center justify-center rounded-full">
              <MdOutlineCheckCircle size={40} className="text-sage-50" aria-hidden />
            </div>
          </motion.div>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h1 className="text-heading-lg text-pine sm:text-heading-xl">
              ¡Bienvenido a <span className="text-sage-600">Agro</span>
              <span className="text-pine">Nexo</span>!
            </h1>
            <p className="text-body-lg text-sage-600 mt-3">
              {firstName && (
                <>
                  Hola, <strong className="text-pine font-semibold">{firstName}</strong>.{' '}
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
              <MdOutlineCheckCircle />
              <AlertTitle>Cuenta creada con éxito</AlertTitle>
              <AlertDescription>
                Entrá a tu panel para empezar a conectarte con profesionales.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Card de confirmación */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mt-8 w-full"
          >
            <Card className="flex flex-col gap-3 px-6 py-5">
              <div className="flex items-center gap-3">
                <BrandMark variant="light" className="h-5 w-5 flex-shrink-0" />
                <p className="text-body-sm text-pine">
                  Tu perfil de <strong>{roleLabel}</strong> está listo
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-pine/10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="text-caption text-pine font-bold">#</span>
                </div>
                <p className="text-body-sm text-sage-600">
                  ID público: <span className="text-pine font-mono font-semibold">{publicId}</span>
                </p>
              </div>
              <Separator className="mt-1" />
              <p className="text-body-sm text-sage-600">
                Podés completar tu perfil, agregar tus campos y conectarte con profesionales desde
                tu panel.
              </p>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8 flex w-full flex-col gap-3"
          >
            <Button
              render={<Link href="/dashboard" />}
              nativeButton={false}
              size="lg"
              className="w-full"
            >
              Ir a mi panel
              <MdArrowForward data-icon="inline-end" size={16} aria-hidden />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
