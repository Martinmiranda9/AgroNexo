import { redirect } from 'next/navigation';
import { getMatchesAction } from '@/core/actions/get-matches.action';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import { AppHeader } from '@/features/app-shell';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { MatchRequestList, MatchRequestsEmpty } from '@/features/matches';
import { ROUTES } from '@/shared/constants/routes';

export const dynamic = 'force-dynamic';

/**
 * Solicitudes de match. El profesional ve las que recibió, con la ficha de necesidad de cada productor, y las acepta o
 * rechaza; el productor ve las que envió. El backend ya acota la lista al usuario (`GET /api/v1/matches`).
 */
export default async function MatchesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect(ROUTES.login);

  const current = await fetchCurrentUser();
  if (current.status === 'unavailable') return <BackendUnavailable />;
  if (current.status === 'not-registered') redirect(ROUTES.onboarding);

  const viewer = current.user.userType;
  if (viewer !== 'Producer' && viewer !== 'Professional') redirect(ROUTES.dashboard);

  const result = await getMatchesAction();
  if (result.status === 'unauthorized') redirect(ROUTES.login);
  if (result.status !== 'ok') return <BackendUnavailable />;

  const { matches } = result;
  const waiting = matches.filter((match) => match.status === 'Pending').length;

  const subtitle =
    viewer === 'Producer'
      ? 'Las solicitudes que enviaste y cómo respondió cada profesional.'
      : waiting > 0
        ? `Tenés ${waiting} ${waiting === 1 ? 'solicitud esperando' : 'solicitudes esperando'} tu respuesta.`
        : 'Los productores que te eligieron.';

  return (
    <div className="bg-paper min-h-[100dvh]">
      <AppHeader
        user={{
          firstName: current.user.firstName ?? sessionUser.firstName ?? '',
          lastName: sessionUser.lastName ?? '',
          role: viewer,
          publicId: current.user.publicId ?? null,
          avatarUrl: sessionUser.picture,
        }}
        pendingCount={waiting}
      />

      <main className="mx-auto max-w-[1180px] px-4 pt-8 pb-16 sm:px-6">
        <h1 className="text-heading-lg tracking-heading text-pine">
          {viewer === 'Producer' ? 'Mis solicitudes' : 'Solicitudes de match'}
        </h1>
        <p className="text-body-sm text-olive mt-1">{subtitle}</p>

        <div className="mt-8">
          {matches.length > 0 ? (
            <MatchRequestList matches={matches} viewer={viewer} />
          ) : (
            <MatchRequestsEmpty viewer={viewer} />
          )}
        </div>
      </main>
    </div>
  );
}
