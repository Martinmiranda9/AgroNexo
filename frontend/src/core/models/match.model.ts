import type { ProfessionalRole } from './identity.model';

export interface Match {
  id: string;
}

// ─── Búsqueda de profesionales (POST /api/v1/match-discovery) ────────────────

/** Profesional recomendado, tal como lo devuelve el backend (`MatchRecommendationResponse`). */
export interface MatchRecommendation {
  id: string;
  professionalId: string;
  firstName: string;
  lastName: string;
  role: ProfessionalRole;
  specialty: string;
  yearsExperience: number;
  isVerified: boolean;
  maxCapacity: number;
  activeMatches: number;
  /** Distancia desde el punto buscado hasta el área de cobertura; 0 si el punto está dentro. */
  distanceKm: number;
  /** Puntaje compuesto 0–1. Define el orden; no se muestra crudo. */
  score: number;
  rankPosition: number;
}

export interface MatchDiscoveryResult {
  id: string;
  producerId: string;
  latitude: number;
  longitude: number;
  requestedSpecialty: string;
  requiresFieldPresence: boolean;
  createdAt: string;
  recommendations: MatchRecommendation[];
}

export interface SearchProfessionalsInput {
  latitude: number;
  longitude: number;
  /** Si es `true`, el backend deja solo a quienes cubren el punto (agrónomos). */
  requiresFieldPresence: boolean;
}

export type SearchProfessionalsResult =
  | { status: 'ok'; discovery: MatchDiscoveryResult }
  /** Sin sesión válida o token vencido. */
  | { status: 'unauthorized' }
  /** La cuenta no es de productor (política `IsProducer`). */
  | { status: 'forbidden' }
  /** Backend caído, sin red o respuesta inesperada. */
  | { status: 'unavailable' };

// ─── Solicitud de match (POST /api/v1/matches) ───────────────────────────────

export type CreateMatchResult =
  | { status: 'created'; matchId: string }
  /** Ya existe un match Pending/Activo con ese profesional (409). */
  | { status: 'conflict' }
  | { status: 'not-found' }
  | { status: 'unauthorized' }
  | { status: 'forbidden' }
  | { status: 'unavailable' };

// ─── Zona de búsqueda ────────────────────────────────────────────────────────

export interface SearchLocation {
  latitude: number;
  longitude: number;
  /** Texto para mostrar: "Pehuajó, Buenos Aires". */
  label: string;
}
