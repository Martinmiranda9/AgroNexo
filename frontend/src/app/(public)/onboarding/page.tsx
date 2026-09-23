import OnboardingForm from "@/features/auth/components/OnboardingForm";

/**
 * /onboarding — Registro multipaso AgroNexo
 * Server Component que delega toda la interactividad al Client Component OnboardingForm.
 */
export const metadata = {
  title: "Crear cuenta",
  description: "Registrate en AgroNexo y conectá tu campo con los mejores profesionales del agro argentino.",
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
