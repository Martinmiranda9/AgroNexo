'use client';

import { useEffect } from 'react';
import { AUTH_CONTINUE_PATH } from '@/core/auth/config';
import { notifyGoogleSignInComplete } from '@/core/auth/google-sign-in';

const CLOSE_WAIT_MS = 400;

/**
 * Última página del popup de Google: avisa a la ventana principal y se cierra. Si no era un popup
 * (el navegador lo bloqueó y se usó la redirección de página completa), sigue el flujo normal:
 * /auth/continue si salió bien, /login con el error si no.
 *
 * `window.opener` es la única señal confiable de que esta pestaña es en verdad el popup: la mayoría
 * de los navegadores ya rechazan `window.close()` sobre una pestaña que el usuario abrió (no un script),
 * pero no todos, así que no hay que confiar solo en eso — cerrar por error dejaría al usuario sin pestaña.
 */
export default function PopupComplete({ error }: { error?: string }) {
  useEffect(() => {
    notifyGoogleSignInComplete(error);
    if (window.opener) window.close();
    const fallback = setTimeout(() => {
      window.location.replace(error ? `/login?error=${encodeURIComponent(error)}` : AUTH_CONTINUE_PATH);
    }, CLOSE_WAIT_MS);
    return () => clearTimeout(fallback);
  }, [error]);

  return (
    <main className="bg-bg-card text-primary flex min-h-[100dvh] w-full items-center justify-center px-6">
      <p role="status" className="text-body-sm">
        Un momento…
      </p>
    </main>
  );
}
