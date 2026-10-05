'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { searchProfessionalsAction } from '@/core/actions/search-professionals.action';
import type { SearchableRole } from '@/core/models/identity.model';
import type { MatchRecommendation, SearchLocation } from '@/core/models/match.model';
import { ROLE_REQUIRES_PRESENCE } from '../config/catalog';
import { SAMPLE_DATA_ENABLED, getSampleDiscovery } from '../data/sample-professionals';
import { buildResults, type ResultView } from '../lib/build-results';
import { interpretNeed, type NeedInterpretation } from '../lib/interpret-need';

export type Phase = 'describe' | 'searching' | 'results';
export type SearchError = 'unavailable' | 'forbidden' | 'unauthorized';

/** Tiempo mínimo del estado "buscando", para que los pasos alcancen a leerse aunque la respuesta sea instantánea. */
const MIN_SEARCHING_MS = 700;

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

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Estado de la pantalla de búsqueda asistida: describir → buscando → resultados. */
export function useMatchDiscovery(location: SearchLocation) {
  const [phase, setPhase] = useState<Phase>('describe');
  const [draft, setDraft] = useState('');
  const [need, setNeed] = useState<NeedInterpretation | null>(null);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [error, setError] = useState<SearchError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<ReadonlySet<string>>(new Set());

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
      const fetched = await fetchRecommendations(location, interpreted.role);
      await wait(Math.max(0, MIN_SEARCHING_MS - (Date.now() - startedAt)));
      if (run !== latest.current) return;

      setNeed(interpreted);
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
      const fetched = await fetchRecommendations(location, role);
      if (run !== latest.current) return;

      apply(fetched);
      setSelectedId(null);
      setRefreshing(false);
    },
    [location, need]
  );

  const removeTopic = useCallback((topicId: string) => {
    setNeed((current) =>
      current ? { ...current, topics: current.topics.filter((id) => id !== topicId) } : current
    );
  }, []);

  const edit = useCallback(() => {
    latest.current++;
    setRefreshing(false);
    setPhase('describe');
  }, []);

  const markSent = useCallback((professionalId: string) => {
    setSentTo((current) => new Set(current).add(professionalId));
  }, []);

  const results: ResultView[] = useMemo(
    () => (need ? buildResults(recommendations, need) : []),
    [recommendations, need]
  );
  const selected = results.find((r) => r.recommendation.id === selectedId) ?? results[0] ?? null;

  return {
    phase,
    draft,
    setDraft,
    need,
    results,
    selected,
    isSample,
    error,
    refreshing,
    sentTo,
    submit,
    changeRole,
    removeTopic,
    edit,
    select: setSelectedId,
    markSent,
    retry: () => submit(draft),
  };
}
