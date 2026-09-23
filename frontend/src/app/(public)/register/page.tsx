import { redirect } from 'next/navigation';

/**
 * /register → redirige permanentemente a /onboarding.
 * El flujo de registro vive en /onboarding.
 */
export default function RegisterPage() {
  redirect('/onboarding');
}
