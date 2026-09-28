import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegistrationWizard, resolveRegistrationKind } from '@/features/onboarding';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { isAuth0Configured } from '@/core/auth/config';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Registrate en AgroNexo y conectá tu campo con los mejores profesionales del agro argentino.',
};

export const dynamic = 'force-dynamic';

interface OnboardingPageProps {
  searchParams: Promise<{ type?: string }>;
}

/**
 * Único flujo de registro. Siempre es el wizard; lo que cambia es dónde empieza:
 *  - sin sesión          → paso "Tu cuenta" (Google, o correo + contraseña + repetir contraseña)
 *  - con sesión y sin perfil → directo al rol, con nombre, apellido y correo ya cargados
 *  - ya registrado       → /dashboard
 *
 * /onboarding?type=agronomist (producer|agronomist|accountant|lawyer|investor) salta la elección de rol.
 * Sin Auth0 configurado (desarrollo local) se muestra el formulario directo, con token de desarrollo.
 */
export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { type } = await searchParams;
  const initialKind = resolveRegistrationKind(type);

  if (!isAuth0Configured()) return <RegistrationWizard initialKind={initialKind} />;

  const user = await getSessionUser();
  if (!user) return <RegistrationWizard initialKind={initialKind} requiresAccount />;

  // Si ya completó el registro no tiene sentido repetirlo; si el backend no responde, tampoco es un usuario nuevo.
  const current = await fetchCurrentUser();
  if (current.status === 'unavailable') return <BackendUnavailable />;
  if (current.status === 'registered') redirect('/dashboard');

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
