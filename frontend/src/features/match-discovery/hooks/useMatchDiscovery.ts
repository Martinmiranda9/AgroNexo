'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { searchProfessionalsAction } from '@/core/actions/search-professionals.action';
import type { SearchableRole } from '@/core/models/identity.model';
import type { MatchRecommendation, SearchLocation } from '@/core/models/match.model';
import { ROLE_REQUIRES_PRESENCE } from '../config/catalog';
import { SAMPLE_DATA_ENABLED, getSampleDiscovery } from '../data/sample-professionals';
import { buildResults, type ResultView } from '../lib/build-results';
import { interpretNeed, type NeedInterpretation } from '../lib/interpret-need';
import { resolvePlaceAction } from '../server/resolve-place.action';

export type Phase = 'describe' | 'searching' | 'results';
export type SearchError = 'unavailable' | 'forbidden' | 'unauthorized';

/** Tiempo mínimo del estado "buscando", para que los pasos alcancen a leerse aunque la respuesta sea instantánea. */
const MIN_SEARCHING_MS = 900;

interface Fetched {
  recommendations: MatchRecommendation[];
  isSample: boolean;
  error: SearchError | null;
}

/**
 * Pide los profesionales al backend. Solo en desarrollo, si el backend no responde o todavía no tiene profesionales
 * cargados, se usan los datos ficticios (y la pantalla lo avisa). En producción nunca se inventa nada.
 */
async function fetchRecommendations(
  location: SearchLocation,
  role: SearchableRole | null
): Promise<Fetched> {
  const input = {
    latitude: location.latitude,
    longitude: location.longitude,
    // Sin profesión elegida se buscan todas: ninguna exige presencia física por sí sola.
    requiresFieldPresence: role ? ROLE_REQUIRES_PRESENCE[role] : false,
  };
  const result = await searchProfessionalsAction(input);

  if (
    result.status === 'ok' &&
    (result.discovery.recommendations.length > 0 || !SAMPLE_DATA_ENABLED)
  ) {
    return { recommendations: result.discovery.recommendations, isSample: false, error: null };
  }
  if (SAMPLE_DATA_ENABLED) {
    return {
      recommendations: getSampleDiscovery(input).recommendations,
      isSample: true,
      error: null,
    };
  }
  return {
    recommendations: [],
    isSample: false,
    error: result.status === 'ok' ? null : result.status,
  };
}

/** Dónde se busca: el lugar de registro del productor o el que nombró en el pedido. */
interface SearchZone {
  location: SearchLocation;
  /** `true` si el punto viene de lo que escribió (y no es el de su registro). */
  fromPrompt: boolean;
  /** Lugar que nombró pero no se pudo ubicar: se buscó cerca de su campo y la pantalla lo avisa. */
  unresolved: string | null;
}

/** Combina lo que escribió con su lugar de registro: sin lugar nombrado, o si no se encuentra, manda el registro. */
async function resolveZone(
  need: NeedInterpretation,
  registered: SearchLocation
): Promise<SearchZone> {
  if (!need.place) return { location: registered, fromPrompt: false, unresolved: null };

  const resolved = await resolvePlaceAction(need.place);
  if (!resolved) return { location: registered, fromPrompt: false, unresolved: need.place };

  // "Córdoba" siendo de Córdoba resuelve a su propio lugar de registro: no es otra zona.
  return { location: resolved, fromPrompt: resolved.label !== registered.label, unresolved: null };
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Estado de la pantalla de búsqueda asistida: describir → buscando → resultados. */
export function useMatchDiscovery(location: SearchLocation) {
  const [phase, setPhase] = useState<Phase>('describe');
  const [draft, setDraft] = useState('');
  const [need, setNeed] = useState<NeedInterpretation | null>(null);
  const [zone, setZone] = useState<SearchZone>({ location, fromPrompt: false, unresolved: null });
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [error, setError] = useState<SearchError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<ReadonlySet<string>>(new Set());
  /** Cuánto tardó la última búsqueda, en segundos: se muestra junto a los resultados. */
  const [searchSeconds, setSearchSeconds] = useState(0);

  // Cada búsqueda lleva un número: si el productor vuelve a buscar, la respuesta vieja se descarta.
  const latest = useRef(0);

  const apply = (fetched: Fetched) => {
    setRecommendations(fetched.recommendations);
    setIsSample(fetched.isSample);
    setError(fetched.error);
  };

  const submit = useCallback(
    async (text: string) => {
      const run = ++latest.current;
      const startedAt = Date.now();
      setDraft(text);
      setPhase('searching');

      const interpreted = await interpretNeed(text);
      const searchZone = await resolveZone(interpreted, location);
      const fetched = await fetchRecommendations(searchZone.location, interpreted.role);
      await wait(Math.max(0, MIN_SEARCHING_MS - (Date.now() - startedAt)));
      if (run !== latest.current) return;

      setSearchSeconds((Date.now() - startedAt) / 1000);
      setNeed(interpreted);
      setZone(searchZone);
      apply(fetched);
      setSelectedId(null);
      setPhase('results');
    },
    [location]
  );

  /** Cambia la profesión: el backend filtra distinto según exija o no presencia en el campo, así que se vuelve a pedir. */
  const changeRole = useCallback(
    async (role: SearchableRole | null) => {
      if (!need) return;
      const run = ++latest.current;
      setNeed({ ...need, role, topics: role === need.role ? need.topics : [] });
      setRefreshing(true);
      const fetched = await fetchRecommendations(zone.location, role);
      if (run !== latest.current) return;

      apply(fetched);
      setSelectedId(null);
      setRefreshing(false);
    },
    [zone.location, need]
  );

  const removeTopic = useCallback((topicId: string) => {
    setNeed((current) =>
      current ? { ...current, topics: current.topics.filter((id) => id !== topicId) } : current
    );
  }, []);

  /** Quita un dato que se entendió mal (actividad, hectáreas o urgencia); no cambia el ranking, sí la ficha. */
  const clearDetail = useCallback((field: 'activity' | 'hectares' | 'urgency') => {
    setNeed((current) => (current ? { ...current, [field]: null } : current));
  }, []);

  const edit = useCallback(() => {
    latest.current++;
    setRefreshing(false);
    setPhase('describe');
  }, []);

  const markSent = useCallback((professionalId: string) => {
    setSentTo((current) => new Set(current).add(professionalId));
  }, []);

  const zoneName = zone.fromPrompt ? zone.location.label : 'tu campo';
  const results: ResultView[] = useMemo(
    () => (need ? buildResults(recommendations, need, zoneName) : []),
    [recommendations, need, zoneName]
  );
  const selected = results.find((r) => r.recommendation.id === selectedId) ?? results[0] ?? null;

  return {
    phase,
    draft,
    setDraft,
    need,
    zone,
    results,
    selected,
    isSample,
    error,
    refreshing,
    sentTo,
    searchSeconds,
    submit,
    changeRole,
    removeTopic,
    clearDetail,
    edit,
    select: setSelectedId,
    markSent,
    retry: () => submit(draft),
  };
}
