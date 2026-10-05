import type { SearchLocation } from '@/core/models/match.model';

/** Centro aproximado de Argentina: último recurso si el productor no tiene provincia ni ciudad cargadas. */
const ARGENTINA_CENTER: SearchLocation = {
  latitude: -38.4161,
  longitude: -63.6167,
  label: 'Argentina',
};

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase();

interface ProducerPlace {
  country?: string;
  province?: string;
  city?: string;
}

/**
 * Punto de búsqueda a partir de la ubicación del registro del productor: ciudad, o centro de la provincia si no
 * hay ciudad. Usa los mismos datos (`country-state-city`) que el formulario de registro, así los nombres coinciden.
 * Es código de servidor: la librería es pesada y no debe viajar al navegador.
 */
export async function resolveSearchLocation({
  country,
  province,
  city,
}: ProducerPlace): Promise<SearchLocation> {
  if (!province) return ARGENTINA_CENTER;

  const { Country, State, City } = await import('country-state-city');

  const countryCode =
    Country.getAllCountries().find((c) => fold(c.name) === fold(country ?? 'Argentina'))?.isoCode ??
    'AR';
  const state = State.getStatesOfCountry(countryCode).find((s) => fold(s.name) === fold(province));
  if (!state) return ARGENTINA_CENTER;

  const town = city
    ? City.getCitiesOfState(countryCode, state.isoCode).find((c) => fold(c.name) === fold(city))
    : undefined;
  const center =
    town?.latitude && town.longitude ? town : state.latitude && state.longitude ? state : undefined;
  if (!center) return ARGENTINA_CENTER;

  return {
    latitude: Number(center.latitude),
    longitude: Number(center.longitude),
    label: town ? `${town.name}, ${state.name}` : state.name,
  };
}
