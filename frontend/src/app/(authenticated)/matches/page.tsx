import { redirect } from 'next/navigation';
import { getMatchesAction } from '@/core/actions/get-matches.action';
import { getWorkspacesAction } from '@/core/actions/get-workspaces.action';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import { AppLayout } from '@/features/app-shell';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import AddToFarmButton from '@/features/farms/components/AddToFarmButton';
import { MatchRequestList, MatchRequestsEmpty, MatchStats } from '@/features/matches';
import { SectionHeader } from '@/ui/components/SectionHeader';
import { ROUTES } from '@/shared/constants/routes';

export const dynamic = 'force-dynamic';

/**
 * Solicitudes de match. El profesional ve las que recibió, con la ficha de necesidad de cada productor, y las acepta o
 * rechaza; el productor ve las que envió. El backend ya acota la lista al usuario (`GET /api/v1/matches`).
 */
export default async function MatchesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect(ROUTES.login);

  // El estado del usuario y las solicitudes solo necesitan el token: van en paralelo.
  const [current, result] = await Promise.all([fetchCurrentUser(), getMatchesAction()]);
  if (current.status === 'unavailable') return <BackendUnavailable />;
  if (current.status === 'not-registered') redirect(ROUTES.onboarding);

  const viewer = current.user.userType;
  if (viewer !== 'Producer' && viewer !== 'Professional') redirect(ROUTES.dashboard);

  if (result.status === 'unauthorized') redirect(ROUTES.login);
  if (result.status !== 'ok') return <BackendUnavailable />;

  const { matches } = result;

  // El productor puede sumar a un profesional aceptado a uno de sus campos. Si los campos no cargan, el atajo no
  // aparece: la lista de solicitudes sigue funcionando igual.
  const farms =
    viewer === 'Producer' && matches.some((match) => match.status === 'Active')
      ? await getWorkspacesAction()
      : null;
  const waiting = matches.filter((match) => match.status === 'Pending').length;

  const subtitle =
    viewer === 'Producer'
      ? 'Las solicitudes que enviaste y cómo respondió cada profesional.'
      : waiting > 0
        ? `Tenés ${waiting} ${waiting === 1 ? 'solicitud esperando' : 'solicitudes esperando'} tu respuesta.`
        : 'Los productores que te eligieron.';

  return (
    <AppLayout
      user={{
        firstName: current.user.firstName ?? sessionUser.firstName ?? '',
        lastName: sessionUser.lastName ?? '',
        role: viewer,
        publicId: current.user.publicId ?? null,
        avatarUrl: sessionUser.picture,
      }}
      pendingCount={waiting}
    >
      <main className="mx-auto max-w-[1180px] pt-4 pb-10">
        <SectionHeader
          as="h1"
          title={viewer === 'Producer' ? 'Mis solicitudes' : 'Solicitudes de match'}
          description={subtitle}
        />

        {matches.length > 0 && (
          <div className="mt-6">
            <MatchStats matches={matches} viewer={viewer} />
          </div>
        )}

        <div className="mt-6">
          {matches.length > 0 ? (
            <MatchRequestList
              matches={matches}
              viewer={viewer}
              renderActiveAction={
                farms?.status === 'ok'
                  ? (match) => (
                      <AddToFarmButton
                        professionalId={match.professionalId}
                        professionalName={match.professionalName}
                        farms={farms.workspaces}
                      />
                    )
                  : undefined
              }
            />
          ) : (
            <MatchRequestsEmpty viewer={viewer} />
          )}
        </div>
      </main>
    </AppLayout>
  );
}
