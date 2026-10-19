import { redirect } from 'next/navigation';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { getWorkspacesAction } from '@/core/actions/get-workspaces.action';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import { homeRouteFor } from '@/core/services/home-route.service';
import { ROUTES } from '@/shared/constants/routes';

export const dynamic = 'force-dynamic';

/**
 * Destino de todos los logins (Google o email) y del logo. Con sesión activa:
 *  - ya registrado con un campo en uso → el tablero del campo (con varios, el primero por nombre)
 *  - ya registrado sin campos          → /match-discovery (productor) o /dashboard (profesional)
 *  - primer ingreso                    → /onboarding (con nombre y correo prellenados desde Google)
 *  - backend caído                     → pantalla de error; nunca se lo manda al onboarding por un corte.
 */
export default async function AuthContinuePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const current = await fetchCurrentUser();
  if (current.status === 'unavailable') return <BackendUnavailable />;

  if (current.status !== 'registered') redirect(ROUTES.onboarding);

  // Si los campos no llegan, entra igual a la pantalla de su rol.
  const workspaces = await getWorkspacesAction();
  redirect(
    homeRouteFor(current.user.userType, workspaces.status === 'ok' ? workspaces.workspaces : null)
  );
}
