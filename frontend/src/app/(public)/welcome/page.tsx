import { getSessionUser } from '@/core/auth/server';
import { VerificationBanner } from '@/ui/components';
import WelcomeContent from './WelcomeContent';

// ─── Server Component: sesión para el banner de verificación de correo ───────
// El contenido de bienvenida (`WelcomeContent`) no cambia; solo se agrega el banner por encima.

export default async function WelcomePage() {
  const user = await getSessionUser();

  return (
    <div className="bg-beige">
      {user && (
        <div className="mx-auto w-full max-w-md px-6 pt-6">
          <VerificationBanner provider={user.provider} />
        </div>
      )}
      <WelcomeContent />
    </div>
  );
}
