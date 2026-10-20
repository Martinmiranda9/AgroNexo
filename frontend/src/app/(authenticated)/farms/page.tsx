import { redirect } from 'next/navigation';
import { getWorkspacesAction } from '@/core/actions/get-workspaces.action';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import { AppLayout } from '@/features/app-shell';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { FarmsScreen } from '@/features/farms';
import { ROUTES } from '@/shared/constants/routes';

export const dynamic = 'force-dynamic';

/**
 * Campos. El productor ve los suyos, los crea y suma a su equipo; el profesional ve los campos donde lo sumaron.
 * El backend acota la lista al usuario (`GET /api/v1/workspaces`).
 */
export default async function FarmsPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { nuevo } = await searchParams;
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect(ROUTES.login);

  const current = await fetchCurrentUser();
  if (current.status === 'unavailable') return <BackendUnavailable />;
  if (current.status === 'not-registered') redirect(ROUTES.onboarding);

  const viewer = current.user.userType;
  if (viewer !== 'Producer' && viewer !== 'Professional') redirect(ROUTES.dashboard);

  const result = await getWorkspacesAction();
  if (result.status === 'unauthorized') redirect(ROUTES.login);
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
      <main className="mx-auto max-w-[1180px] pt-4 pb-10">
        <FarmsScreen workspaces={result.workspaces} viewer={viewer} startCreating={nuevo === '1'} />
      </main>
    </AppLayout>
  );
}
