import { notFound, redirect } from 'next/navigation';
import { getFarmDashboardAction } from '@/core/actions/get-farm-dashboard.action';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import { AppLayout } from '@/features/app-shell';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import FarmDashboardScreen from '@/features/farms/components/dashboard/FarmDashboardScreen';
import { greetingFor } from '@/features/farms/lib/dashboard-view';
import { ROUTES } from '@/shared/constants/routes';

export const dynamic = 'force-dynamic';

interface FarmPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ campaign?: string }>;
}

/**
 * Tablero de un campo, el mismo para el productor dueño y para los profesionales del equipo. Quien no tiene acceso ve
 * "no encontrado": el backend responde 404 para no revelar que el campo existe.
 */
export default async function FarmPage({ params, searchParams }: FarmPageProps) {
  const [{ id }, { campaign }] = await Promise.all([params, searchParams]);

  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect(ROUTES.login);

  // El estado del usuario y el tablero solo necesitan el token: van en paralelo.
  const [current, result] = await Promise.all([
    fetchCurrentUser(),
    getFarmDashboardAction(id, campaign),
  ]);
  if (current.status === 'unavailable') return <BackendUnavailable />;
  if (current.status === 'not-registered') redirect(ROUTES.onboarding);

  const viewer = current.user.userType;
  if (viewer !== 'Producer' && viewer !== 'Professional') redirect(ROUTES.dashboard);

  if (result.status === 'unauthorized') redirect(ROUTES.login);
  if (result.status === 'not-found') notFound();
  if (result.status !== 'ok') return <BackendUnavailable />;

  return (
    <AppLayout
      user={{
        firstName: current.user.firstName ?? sessionUser.firstName ?? '',
        lastName: sessionUser.lastName ?? '',
        role: viewer,
        publicId: current.user.publicId ?? null,
        avatarUrl: sessionUser.picture,
      }}
    >
      {/* Tablero a todo el ancho: con muchas cards, centrarlo en 1280 px dejaba los costados vacíos. */}
      <main className="pt-4 pb-10">
        <FarmDashboardScreen
          dashboard={result.dashboard}
          greeting={greetingFor(new Date())}
          viewerFirstName={current.user.firstName ?? sessionUser.firstName ?? ''}
        />
      </main>
    </AppLayout>
  );
}
