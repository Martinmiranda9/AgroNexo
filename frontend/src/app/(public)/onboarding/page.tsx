import type { Metadata } from 'next';
import { RegistrationWizard, resolveRegistrationKind } from '@/features/onboarding';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Registrate en AgroNexo y conectá tu campo con los mejores profesionales del agro argentino.',
};

interface OnboardingPageProps {
  searchParams: Promise<{ type?: string }>;
}

/**
 * /onboarding                → arranca en la elección de rol.
 * /onboarding?type=agronomist → (producer|agronomist|accountant|lawyer|investor) salta la elección de rol.
 */
export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { type } = await searchParams;
  return <RegistrationWizard initialKind={resolveRegistrationKind(type)} />;
}
