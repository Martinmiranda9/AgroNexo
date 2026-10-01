import { redirect } from 'next/navigation';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { Avatar, Badge, BrandLogo, Card } from '@/ui/components';
import LogoutButton from '@/features/auth/components/LogoutButton';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';

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
  const displayName = user.firstName ?? sessionUser.firstName ?? 'AgroNexo';
  const roleLabel = user.userType ? ROLE_LABEL[String(user.userType)] : undefined;

  return (
    <main className="min-h-[100dvh] w-full bg-beige">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <BrandLogo />
        <LogoutButton />
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 pb-16 pt-6 text-center">
        <Avatar initials={initialsOf(displayName)} size="lg" />
        <h1 className="text-heading-lg tracking-heading mt-4 text-pine">Hola, {displayName}</h1>
        <p className="text-body-sm text-primary mt-2">Tu sesión está activa y tu perfil ya quedó registrado.</p>

        <div className="mt-4 flex items-center gap-2">
          {roleLabel && <Badge variant="positive">{roleLabel}</Badge>}
          {user.publicId && <Badge variant="neutral">ID #{user.publicId}</Badge>}
        </div>

        <Card className="mt-10 w-full" coreClassName="flex flex-col items-center gap-3 px-6 py-10">
          <MagnifyingGlass size={32} weight="regular" className="text-primary" aria-hidden />
          <p className="text-body font-medium text-pine">Búsqueda de profesionales</p>
          <p className="text-body-sm text-primary max-w-sm">
            Esta sección (el match entre productores y profesionales) se desarrolla en la próxima etapa.
          </p>
        </Card>
      </div>
    </main>
  );
}
