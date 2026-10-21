'use client';

import { MdOutlineCloudOff } from 'react-icons/md';
import BrandLogo from '@/ui/components/BrandLogo';
import { Button } from '@/ui/components/Button';

/**
 * Pantalla para cuando la sesión es válida pero el servidor no responde. Es un estado distinto de
 * "usuario nuevo": mandar a alguien ya registrado al onboarding por un corte sería un error.
 */
export default function BackendUnavailable() {
  return (
    <main className="bg-card text-foreground flex min-h-[100dvh] w-full flex-col items-center justify-center px-6">
      <div role="alert" className="flex w-full max-w-[380px] flex-col items-center text-center">
        <BrandLogo />
        <MdOutlineCloudOff size={40} className="text-muted-foreground mt-10" aria-hidden />
        <h1 className="text-heading-md tracking-heading mt-4">No pudimos conectarnos</h1>
        <p className="text-body-sm text-muted-foreground mt-2">
          Tu sesión está bien, pero el servidor no responde en este momento. Probá de nuevo en unos
          segundos.
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-8 w-full"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    </main>
  );
}
