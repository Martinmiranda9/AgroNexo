import { redirect } from 'next/navigation';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';

export const dynamic = 'force-dynamic';

/**
 * Destino de todos los logins (Google o email). Con sesión activa:
 *  - ya registrado  → /dashboard
 *  - primer ingreso → /onboarding (con nombre y correo prellenados desde Google)
 *  - backend caído  → pantalla de error; nunca se lo manda al onboarding por un corte.
 */
export default async function AuthContinuePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const current = await fetchCurrentUser();
  if (current.status === 'unavailable') return <BackendUnavailable />;

  redirect(current.status === 'registered' ? '/dashboard' : '/onboarding');
}
