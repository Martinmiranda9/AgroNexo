import { redirect } from 'next/navigation';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';

export const dynamic = 'force-dynamic';

/**
 * Destino de todos los logins (Google o email). Con sesión activa:
 *  - ya registrado  → /dashboard
 *  - primer ingreso → /onboarding (con nombre y correo prellenados desde Google)
 */
export default async function AuthContinuePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const current = await fetchCurrentUser();
  redirect(current?.isRegistered ? '/dashboard' : '/onboarding');
}
