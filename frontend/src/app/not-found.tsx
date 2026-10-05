import Link from 'next/link';
import { BrandLogo, Button } from '@/ui/components';

export default function NotFound() {
  return (
    <main className="bg-beige flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 text-pine">
      <div className="flex w-full max-w-[380px] flex-col items-center text-center">
        <BrandLogo />
        <p className="text-heading-xl font-semibold tracking-heading mt-10">404</p>
        <h1 className="text-heading-md tracking-heading mt-2">Esta página no existe</h1>
        <p className="text-body-sm text-olive mt-2">
          Puede que el enlace esté roto o que la página se haya movido.
        </p>
        <Button render={<Link href="/" />} nativeButton={false} size="lg" className="mt-8 w-full">
          Volver al inicio
        </Button>
      </div>
    </main>
  );
}
