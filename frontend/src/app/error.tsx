'use client';

import { WarningCircle } from '@phosphor-icons/react';
import { BrandLogo, Button } from '@/ui/components';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bg-beige flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 text-pine">
      <div role="alert" className="flex w-full max-w-[380px] flex-col items-center text-center">
        <BrandLogo />
        <WarningCircle size={40} weight="regular" className="text-danger mt-10" aria-hidden />
        <h1 className="text-heading-md tracking-heading mt-4">Algo salió mal</h1>
        <p className="text-body-sm text-primary mt-2">
          Ocurrió un error inesperado. Probá de nuevo en unos segundos.
        </p>
        <Button type="button" size="lg" fullWidth className="mt-8" onClick={() => reset()}>
          Reintentar
        </Button>
      </div>
    </main>
  );
}
