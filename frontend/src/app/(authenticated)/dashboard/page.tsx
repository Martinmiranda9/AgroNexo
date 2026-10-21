import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MdArrowForward, MdOutlineCloudOff } from 'react-icons/md';
import { Alert, AlertDescription, AlertTitle } from '@/ui/components/Alert';
import { Badge } from '@/ui/components/Badge';
import BrandLogo from '@/ui/components/BrandLogo';
import { Button } from '@/ui/components/Button';
import { SectionHeader } from '@/ui/components/SectionHeader';
import { AppLayout } from '@/features/app-shell';
import LogoutButton from '@/features/auth/components/LogoutButton';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { MatchRequestList, MatchRequestsEmpty, MatchStats } from '@/features/matches';
import { greetingFor } from '@/features/farms/lib/dashboard-view';
import { getMatchesAction } from '@/core/actions/get-matches.action';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import { ROUTES } from '@/shared/constants/routes';

export const dynamic = 'force-dynamic';

/** Solicitudes pendientes que entran en el panel; el resto se ve en "Solicitudes". */
const MAX_PENDING = 4;

/**
 * Panel del profesional: el saludo, el resumen de sus solicitudes y las que esperan respuesta, para aceptarlas o
 * rechazarlas desde acá. El productor entra directo a la búsqueda.
 */
export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect(ROUTES.login);

  // El estado del usuario y sus solicitudes solo necesitan el token: van en paralelo.
  const [current, result] = await Promise.all([fetchCurrentUser(), getMatchesAction()]);
  if (current.status === 'unavailable') return <BackendUnavailable />;
  if (current.status === 'not-registered') redirect(ROUTES.onboarding);

  const { user } = current;
  // El productor entra directo a la búsqueda de profesionales; los demás roles siguen en este panel.
  if (user.userType === 'Producer') redirect(ROUTES.matchDiscovery);
  const displayName = user.firstName ?? sessionUser.firstName ?? '';

  // Un rol sin marco (no debería pasar): encabezado simple con el cierre de sesión.
  if (user.userType !== 'Professional') {
    return (
      <main className="bg-background min-h-[100dvh] w-full">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <BrandLogo />
          <LogoutButton />
        </header>
        <div className="mx-auto max-w-2xl px-6 pt-6 pb-16">
          <SectionHeader
            as="h1"
            title={displayName ? `Hola, ${displayName}` : 'Hola'}
            description="Tu sesión está activa y tu perfil ya quedó registrado."
          />
        </div>
      </main>
    );
  }

  if (result.status === 'unauthorized') redirect(ROUTES.login);
  const matches = result.status === 'ok' ? result.matches : null;
  const pending = (matches ?? []).filter((match) => match.status === 'Pending');

  return (
    <AppLayout
      user={{
        firstName: displayName,
        lastName: sessionUser.lastName ?? '',
        role: 'Professional',
        publicId: user.publicId ?? null,
        avatarUrl: sessionUser.picture,
      }}
      pendingCount={pending.length}
    >
      <main className="mx-auto flex max-w-[1180px] flex-col gap-6 pt-4 pb-10">
        <SectionHeader
          as="h1"
          title={displayName ? `${greetingFor(new Date())}, ${displayName}` : 'Panel'}
          description={
            pending.length > 0
              ? `Tenés ${pending.length} ${pending.length === 1 ? 'solicitud esperando' : 'solicitudes esperando'} tu respuesta.`
              : 'Acá ves cómo vienen tus solicitudes y los productores que te eligieron.'
          }
          actions={user.publicId && <Badge variant="secondary">ID #{user.publicId}</Badge>}
        />

        {matches === null ? (
          <Alert variant="warning">
            <MdOutlineCloudOff aria-hidden />
            <AlertTitle>No pudimos traer tus solicitudes</AlertTitle>
            <AlertDescription>Probá de nuevo en unos minutos.</AlertDescription>
          </Alert>
        ) : matches.length === 0 ? (
          <MatchRequestsEmpty viewer="Professional" />
        ) : (
          <>
            <MatchStats matches={matches} viewer="Professional" />

            <section aria-label="Esperando tu respuesta" className="flex flex-col gap-4">
              <SectionHeader
                title="Esperando tu respuesta"
                description={
                  pending.length > 0
                    ? 'Mirá la zona, las hectáreas y lo que necesita cada productor antes de responder.'
                    : 'Respondiste todas las solicitudes.'
                }
                actions={
                  <Button asChild variant="outline">
                    <Link href={ROUTES.matches}>
                      Ver todas
                      <MdArrowForward data-icon="inline-end" aria-hidden />
                    </Link>
                  </Button>
                }
              />
              {pending.length > 0 && (
                <MatchRequestList matches={pending.slice(0, MAX_PENDING)} viewer="Professional" />
              )}
            </section>
          </>
        )}
      </main>
    </AppLayout>
  );
}
