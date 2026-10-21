'use client';

import { MdErrorOutline } from 'react-icons/md';
import BrandLogo from '@/ui/components/BrandLogo';
import { Button } from '@/ui/components/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bg-sage-50 text-foreground flex min-h-[100dvh] w-full flex-col items-center justify-center px-6">
      <div role="alert" className="flex w-full max-w-[380px] flex-col items-center text-center">
        <BrandLogo />
        <MdErrorOutline size={40} className="text-status-red mt-10" aria-hidden />
        <h1 className="text-heading-md tracking-heading mt-4">Algo salió mal</h1>
        <p className="text-body-sm text-muted-foreground mt-2">
          Ocurrió un error inesperado. Probá de nuevo en unos segundos.
        </p>
        <Button type="button" size="lg" className="mt-8 w-full" onClick={() => reset()}>
          Reintentar
        </Button>
      </div>
    </main>
  );
}
