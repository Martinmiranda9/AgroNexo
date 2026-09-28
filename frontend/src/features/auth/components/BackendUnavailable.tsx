'use client';

import { CloudSlash } from '@phosphor-icons/react';
import { BrandLogo, Button } from '@/ui/components';

/**
 * Pantalla para cuando la sesión es válida pero el servidor no responde. Es un estado distinto de
 * "usuario nuevo": mandar a alguien ya registrado al onboarding por un corte sería un error.
 */
export default function BackendUnavailable() {
  return (
    <main className="bg-bg-card text-pine flex min-h-[100dvh] w-full flex-col items-center justify-center px-6">
      <div role="alert" className="flex w-full max-w-[380px] flex-col items-center text-center">
        <BrandLogo />
        <CloudSlash size={40} weight="regular" className="text-primary mt-10" aria-hidden />
        <h1 className="text-heading-md tracking-heading mt-4">No pudimos conectarnos</h1>
        <p className="text-body-sm text-primary mt-2">
          Tu sesión está bien, pero el servidor no responde en este momento. Probá de nuevo en unos segundos.
        </p>
        <Button type="button" size="lg" fullWidth className="mt-8" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    </main>
  );
}
