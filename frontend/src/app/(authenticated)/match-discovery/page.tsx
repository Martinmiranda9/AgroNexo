import { redirect } from 'next/navigation';
import BackendUnavailable from '@/features/auth/components/BackendUnavailable';
import { MatchDiscoveryScreen } from '@/features/match-discovery';
import { getProducerProfileAction } from '@/core/actions/get-producer-profile.action';
import { fetchCurrentUser, getSessionUser } from '@/core/auth/server';
import { resolveSearchLocation } from '@/core/services/location.service';
import { ROUTES } from '@/shared/constants/routes';

export const dynamic = 'force-dynamic';

/**
 * Home del productor tras registrarse: búsqueda asistida de profesionales.
 * Solo para productores (el backend también lo exige con la política `IsProducer`); el resto de los roles sigue en el panel.
 */
export default async function MatchDiscoveryPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect(ROUTES.login);

  const current = await fetchCurrentUser();
  if (current.status === 'unavailable') return <BackendUnavailable />;
  if (current.status === 'not-registered') redirect(ROUTES.onboarding);
  if (current.user.userType !== 'Producer') redirect(ROUTES.dashboard);

  // El perfil trae el apellido y la ubicación de registro; si falla, la pantalla igual funciona con lo que ya se sabe.
  const profile = await getProducerProfileAction();
  const location = await resolveSearchLocation({
    country: profile?.country,
    province: profile?.province,
    city: profile?.city,
  });

  return (
    <MatchDiscoveryScreen
      user={{
        firstName: profile?.firstName ?? current.user.firstName ?? sessionUser.firstName ?? '',
        lastName: profile?.lastName ?? sessionUser.lastName ?? '',
        publicId: profile?.publicId ?? current.user.publicId ?? null,
      }}
      location={location}
    />
  );
}
