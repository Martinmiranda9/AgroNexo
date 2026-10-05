import type { MatchDiscoveryResult, MatchRecommendation } from '@/core/models/match.model';
import type { SearchProfessionalsInput } from '@/core/models/match.model';

/**
 * DATOS FICTICIOS, solo para desarrollo. Mismo formato que devuelve `POST /api/v1/match-discovery`, con un
 * profesional por cada rol, para poder ver la pantalla sin base de datos cargada. En producción no se usan
 * (ver `SAMPLE_DATA_ENABLED`): si el backend falla, la pantalla muestra el error y no profesionales inventados.
 */
export const SAMPLE_DATA_ENABLED = process.env.NODE_ENV !== 'production';

const sample = (
  n: number,
  p: Omit<MatchRecommendation, 'id' | 'professionalId' | 'score' | 'rankPosition'> & {
    score: number;
  }
): MatchRecommendation => ({
  id: `sample-recommendation-${n}`,
  professionalId: `sample-professional-${n}`,
  rankPosition: n,
  ...p,
});

const SAMPLE_RECOMMENDATIONS: MatchRecommendation[] = [
  sample(1, {
    firstName: 'Laura',
    lastName: 'Peralta',
    role: 'Agronomist',
    specialty: 'Cultivos extensivos',
    yearsExperience: 12,
    isVerified: true,
    maxCapacity: 15,
    activeMatches: 6,
    distanceKm: 0,
    score: 0.94,
  }),
  sample(2, {
    firstName: 'Martín',
    lastName: 'Ruiz',
    role: 'Accountant',
    specialty: 'Impuestos agropecuarios',
    yearsExperience: 9,
    isVerified: true,
    maxCapacity: 20,
    activeMatches: 11,
    distanceKm: 0,
    score: 0.91,
  }),
  sample(3, {
    firstName: 'Sofía',
    lastName: 'Benítez',
    role: 'Lawyer',
    specialty: 'Arrendamientos rurales',
    yearsExperience: 15,
    isVerified: true,
    maxCapacity: 12,
    activeMatches: 4,
    distanceKm: 0,
    score: 0.9,
  }),
  sample(4, {
    firstName: 'Julieta',
    lastName: 'Ferrero',
    role: 'Investor',
    specialty: 'Financiamiento de campaña',
    yearsExperience: 8,
    isVerified: true,
    maxCapacity: 10,
    activeMatches: 3,
    distanceKm: 0,
    score: 0.86,
  }),
  sample(5, {
    firstName: 'Ramiro',
    lastName: 'Díaz',
    role: 'Agronomist',
    specialty: 'Agricultura de precisión',
    yearsExperience: 16,
    isVerified: true,
    maxCapacity: 18,
    activeMatches: 9,
    distanceKm: 38,
    score: 0.8,
  }),
  sample(6, {
    firstName: 'Valeria',
    lastName: 'Montes',
    role: 'Accountant',
    specialty: 'Liquidación de granos',
    yearsExperience: 7,
    isVerified: true,
    maxCapacity: 20,
    activeMatches: 14,
    distanceKm: 0,
    score: 0.78,
  }),
  sample(7, {
    firstName: 'Pablo',
    lastName: 'Iturbe',
    role: 'Lawyer',
    specialty: 'Sucesiones',
    yearsExperience: 8,
    isVerified: false,
    maxCapacity: 10,
    activeMatches: 2,
    distanceKm: 0,
    score: 0.62,
  }),
  sample(8, {
    firstName: 'Tomás',
    lastName: 'Gallo',
    role: 'Agronomist',
    specialty: 'Pasturas y forraje',
    yearsExperience: 2,
    isVerified: false,
    maxCapacity: 12,
    activeMatches: 1,
    distanceKm: 71,
    score: 0.5,
  }),
  sample(9, {
    firstName: 'Javier',
    lastName: 'Ortiz',
    role: 'Accountant',
    specialty: 'Créditos y garantías',
    yearsExperience: 18,
    isVerified: true,
    maxCapacity: 10,
    activeMatches: 10,
    distanceKm: 0,
    score: 0.47,
  }),
];

const AGRONOMIST_ROLE = 'Agronomist';

/** Misma regla que el backend: con `requiresFieldPresence`, quedan solo quienes cubren el punto buscado. */
export function getSampleDiscovery(input: SearchProfessionalsInput): MatchDiscoveryResult {
  const recommendations = SAMPLE_RECOMMENDATIONS.filter(
    (r) => !input.requiresFieldPresence || r.role !== AGRONOMIST_ROLE || r.distanceKm < 100
  );

  return {
    id: 'sample-discovery',
    producerId: 'sample-producer',
    latitude: input.latitude,
    longitude: input.longitude,
    requestedSpecialty: '',
    requiresFieldPresence: input.requiresFieldPresence,
    createdAt: new Date().toISOString(),
    recommendations,
  };
}
