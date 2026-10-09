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

const GEOREF_LOCALITIES_URL = 'https://apis.datos.gob.ar/georef/api/localidades';
const GEOREF_TIMEOUT_MS = 2500;

/** Cómo se suele escribir la Ciudad de Buenos Aires, que en el dataset figura con su nombre oficial. */
const PROVINCE_ALIASES: Record<string, string> = {
  caba: 'ciudad autonoma de buenos aires',
  'capital federal': 'ciudad autonoma de buenos aires',
  'ciudad de buenos aires': 'ciudad autonoma de buenos aires',
};

/** Palabras que se anteponen al lugar ("en Río Cuarto", "cerca de Villa María", "provincia de Santa Fe"). */
const PLACE_PREFIX =
  /^(?:en|cerca de|por|zona de|zona|provincia de|pcia de|ciudad de|localidad de)\s+/;

interface PlaceCandidate extends SearchLocation {
  province: string;
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Localidades argentinas con ese nombre exacto, según la API oficial Georef. `null` si la API no responde. */
async function searchGeoref(name: string, province?: string): Promise<PlaceCandidate[] | null> {
  const url = new URL(GEOREF_LOCALITIES_URL);
  url.searchParams.set('nombre', name);
  url.searchParams.set('exacto', 'true');
  url.searchParams.set('max', '10');
  url.searchParams.set('campos', 'nombre,provincia.nombre,centroide');
  if (province) url.searchParams.set('provincia', province);

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(GEOREF_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { localidades?: unknown };
    if (!Array.isArray(body.localidades)) return null;

    return body.localidades.flatMap((item): PlaceCandidate[] => {
      const { nombre, provincia, centroide } = item ?? {};
      if (typeof nombre !== 'string' || typeof provincia?.nombre !== 'string') return [];
      if (!isNumber(centroide?.lat) || !isNumber(centroide?.lon)) return [];
      return [
        {
          latitude: centroide.lat,
          longitude: centroide.lon,
          label: `${nombre}, ${provincia.nombre}`,
          province: provincia.nombre,
        },
      ];
    });
  } catch {
    return null;
  }
}

/** Respaldo sin red: las ciudades del mismo dataset que usa el formulario de registro (incompleto, ~960). */
async function searchDataset(name: string): Promise<PlaceCandidate[]> {
  const { State, City } = await import('country-state-city');
  const states = State.getStatesOfCountry('AR');

  return City.getCitiesOfCountry('AR')!.flatMap((city): PlaceCandidate[] => {
    if (fold(city.name) !== name || !city.latitude || !city.longitude) return [];
    const state = states.find((s) => s.isoCode === city.stateCode);
    if (!state) return [];
    return [
      {
        latitude: Number(city.latitude),
        longitude: Number(city.longitude),
        label: `${city.name}, ${state.name}`,
        province: state.name,
      },
    ];
  });
}

/**
 * Elige entre homónimas ("San Francisco" existe en Córdoba y en Jujuy): la provincia que nombró el productor;
 * si no nombró ninguna, la de su registro; si tampoco coincide, la primera que devuelva la fuente.
 */
function pickCandidate(
  candidates: PlaceCandidate[],
  explicitProvince: string | undefined,
  registeredProvince: string | undefined
): PlaceCandidate | null {
  const inProvince = (province?: string) =>
    province ? candidates.filter((c) => fold(c.province) === fold(province)) : [];

  if (explicitProvince) return inProvince(explicitProvince)[0] ?? null;
  return inProvince(registeredProvince)[0] ?? candidates[0] ?? null;
}

/**
 * Convierte el lugar que escribió el productor en un punto de búsqueda, combinándolo con su lugar de registro:
 *  - solo una provincia → si es la de su registro, se busca cerca de su campo; si es otra, cerca del centro de esa provincia;
 *  - una localidad → con la provincia que nombró, o si no con la de su registro, o si no la que coincida;
 *  - no se encuentra → `null` y la pantalla busca cerca de su campo avisándolo.
 * Es código de servidor: consulta la API oficial Georef y usa el dataset pesado de `country-state-city`.
 */
export async function resolveNamedPlace(
  placeText: string,
  registered: ProducerPlace
): Promise<SearchLocation | null> {
  const parts = placeText
    .split(',')
    .map((part) => fold(part).replace(PLACE_PREFIX, '').replace(/\s+/g, ' ').trim())
    .filter((part) => part && part !== 'argentina');
  if (parts.length === 0 || parts.length > 3) return null;

  const { State } = await import('country-state-city');
  const states = State.getStatesOfCountry('AR');
  const asProvince = (part: string) => {
    const name = PROVINCE_ALIASES[part] ?? part;
    return states.find((s) => fold(s.name) === name);
  };

  // La provincia es el último fragmento que lo sea ("Río Cuarto, Córdoba"); el resto nombra la localidad.
  const provinceIndex = parts.findLastIndex((part) => asProvince(part));
  const province = provinceIndex >= 0 ? asProvince(parts[provinceIndex]) : undefined;
  const localityParts = parts.filter((_, index) => index !== provinceIndex);

  const provinceCenter = (): SearchLocation | null =>
    province?.latitude && province.longitude
      ? {
          latitude: Number(province.latitude),
          longitude: Number(province.longitude),
          label: province.name,
        }
      : null;

  if (province && localityParts.length === 0) {
    const isRegisteredProvince =
      registered.province && fold(registered.province) === fold(province.name);
    return isRegisteredProvince ? resolveSearchLocation(registered) : provinceCenter();
  }

  const locality = localityParts[0];
  const candidates =
    (await searchGeoref(locality, province?.name)) ?? (await searchDataset(locality));
  const found = pickCandidate(candidates, province?.name, registered.province);
  if (found) return { latitude: found.latitude, longitude: found.longitude, label: found.label };

  // Localidad desconocida dentro de una provincia que sí nombró: se busca en esa provincia.
  return provinceCenter();
}
