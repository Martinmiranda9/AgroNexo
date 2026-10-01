import { notFound } from 'next/navigation';
import VerificationBanner from '@/ui/components/VerificationBanner';
import { resolveRegistrationKind } from '@/features/onboarding';
import { REGISTRATION_FLOWS } from '@/features/onboarding/config/flows';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import WelcomeContent from './WelcomeContent';

// ─── Server Component: confirma rol/ID por URL limpia (/welcome/{publicId}/{kind}) ──────────────
// El nombre no va en la URL: sale de la sesión o, si está disponible, del registro ya persistido.

interface WelcomePageProps {
  params: Promise<{ publicId: string; kind: string }>;
}

export default async function WelcomePage({ params }: WelcomePageProps) {
  const { publicId, kind: kindParam } = await params;
  const kind = resolveRegistrationKind(kindParam);
  if (!kind || !/^\d+$/.test(publicId)) notFound();

  const user = await getSessionUser();
  const current = user ? await fetchCurrentUser() : null;
  const firstName = (current?.status === 'registered' ? current.user.firstName : undefined) ?? user?.firstName;

  return (
    <div className="bg-beige">
      {user && (
        <div className="mx-auto w-full max-w-md px-6 pt-6">
          <VerificationBanner provider={user.provider} />
        </div>
      )}
      <WelcomeContent firstName={firstName} publicId={publicId} roleLabel={REGISTRATION_FLOWS[kind].roleLabel} />
    </div>
  );
}
