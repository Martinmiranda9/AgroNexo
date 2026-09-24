import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegistrationWizard, resolveRegistrationKind } from '@/features/onboarding';
import AgroNexoAuthModal from '@/features/auth/components/AgroNexoAuthModal';
import { isAuth0Configured } from '@/core/auth/config';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Registrate en AgroNexo y conectá tu campo con los mejores profesionales del agro argentino.',
};

export const dynamic = 'force-dynamic';

interface OnboardingPageProps {
  searchParams: Promise<{ type?: string; error?: string }>;
}

/**
 * /onboarding                → sin cuenta: "Creá tu cuenta" (Google o correo). Con cuenta: el formulario.
 * /onboarding?type=agronomist → (producer|agronomist|accountant|lawyer|investor) salta la elección de rol.
 *
 * Sin Auth0 configurado (desarrollo local) se muestra el formulario directo, como antes.
 */
export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { type, error } = await searchParams;
  const initialKind = resolveRegistrationKind(type);

  if (!isAuth0Configured()) return <RegistrationWizard initialKind={initialKind} />;

  const user = await getSessionUser();
  if (!user) {
    return (
      <main className="min-h-[100dvh] w-full bg-[#fef7e5] text-[#00311e] antialiased">
        <AgroNexoAuthModal mode="signup" error={error} />
      </main>
    );
  }

  // Si ya completó el registro no tiene sentido repetirlo.
  const current = await fetchCurrentUser();
  if (current?.isRegistered) redirect('/dashboard');

  return (
    <RegistrationWizard
      initialKind={initialKind}
      account={{
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        provider: user.provider,
      }}
    />
  );
}
