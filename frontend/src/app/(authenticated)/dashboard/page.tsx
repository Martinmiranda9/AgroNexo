import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Tray } from '@phosphor-icons/react/dist/ssr';
import { Avatar, Badge, BrandLogo, Card, buttonVariants } from '@/ui/components';
import { AppHeader } from '@/features/app-shell';
import LogoutButton from '@/features/auth/components/LogoutButton';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';

/** El backend serializa el enum `UserType` como string (`JsonStringEnumConverter`), no como número. */
const ROLE_LABEL: Record<string, string> = {
  Producer: 'Productor',
  Professional: 'Profesional',
};

function initialsOf(name?: string): string {
  if (!name) return 'AN';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

/** Home tras login/registro: confirma que la sesión y el perfil quedaron bien armados. */
export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');

  const current = await fetchCurrentUser();
  if (current.status === 'unavailable') return <BackendUnavailable />;
  if (current.status === 'not-registered') redirect('/onboarding');

  const { user } = current;
  // El productor entra directo a la búsqueda de profesionales; los demás roles siguen en este panel.
  if (user.userType === 'Producer') redirect(ROUTES.matchDiscovery);
  const displayName = user.firstName ?? sessionUser.firstName ?? 'AgroNexo';
  const roleLabel = user.userType ? ROLE_LABEL[String(user.userType)] : undefined;

  return (
    <main className="bg-beige min-h-[100dvh] w-full">
      {user.userType === 'Professional' ? (
        <AppHeader
          user={{
            firstName: displayName,
            lastName: sessionUser.lastName ?? '',
            role: 'Professional',
            publicId: user.publicId ?? null,
            avatarUrl: sessionUser.picture,
          }}
        />
      ) : (
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <BrandLogo />
          <LogoutButton />
        </header>
      )}

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 pt-6 pb-16 text-center">
        <Avatar initials={initialsOf(displayName)} size="lg" />
        <h1 className="text-heading-lg tracking-heading text-pine mt-4">Hola, {displayName}</h1>
        <p className="text-body-sm text-olive mt-2">
          Tu sesión está activa y tu perfil ya quedó registrado.
        </p>

        <div className="mt-4 flex items-center gap-2">
          {roleLabel && <Badge variant="secondary">{roleLabel}</Badge>}
          {user.publicId && <Badge variant="secondary">ID #{user.publicId}</Badge>}
        </div>

        <Card className="mt-10 w-full" coreClassName="flex flex-col items-center gap-3 px-6 py-10">
          <Tray size={32} weight="regular" className="text-olive" aria-hidden />
          <p className="text-body text-pine font-medium">Solicitudes de match</p>
          <p className="text-body-sm text-olive max-w-sm">
            Mirá las solicitudes de los productores que quieren trabajar con vos: la zona, las
            hectáreas, la urgencia y lo que necesitan.
          </p>
          <Link href={ROUTES.matches} className={cn(buttonVariants({ size: 'lg' }), 'mt-3')}>
            Ver solicitudes
          </Link>
        </Card>
      </div>
    </main>
  );
}
