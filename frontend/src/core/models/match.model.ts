import type { MatchStatus } from '@/shared/constants/match-status';
import type { NeedBrief } from '@/shared/types/need-brief';
import type { ProfessionalRole } from './identity.model';

export type { MatchStatus, NeedBrief };

/** Pedido de match tal como lo devuelve el backend (`MatchResponse`), visto por el productor o por el profesional. */
export interface Match {
  id: string;
  producerId: string;
  producerName: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
  status: MatchStatus;
  requestedAt: string;
  respondedAt: string | null;
  /** Contexto que adjuntó el productor; `null` en pedidos creados sin ficha. */
  needBrief: NeedBrief | null;
  /** Contacto del productor: solo llega al profesional invitado y una vez aceptado el pedido; si no, `null`. */
  producerContact?: MatchContact | null;
}

export interface MatchContact {
  /** Formato internacional (E.164): `+5491155550000`. */
  phoneNumber: string;
  email: string | null;
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
  /** La ficha no cumple las reglas del backend (largo, hectáreas, ids). */
  | { status: 'invalid' }
  | { status: 'unauthorized' }
  | { status: 'forbidden' }
  | { status: 'unavailable' };

// ─── Pedidos de match (GET /api/v1/matches y PATCH /api/v1/matches/{id}/status) ───

export type GetMatchesResult =
  | { status: 'ok'; matches: Match[] }
  | { status: 'unauthorized' }
  | { status: 'forbidden' }
  | { status: 'unavailable' };

/** Respuesta del profesional a un pedido: acepta (`Active`) o rechaza (`Rejected`). */
export type MatchDecision = Extract<MatchStatus, 'Active' | 'Rejected'>;

export type UpdateMatchStatusResult =
  | { status: 'ok'; match: Match }
  | { status: 'not-found' }
  /** El pedido ya no está pendiente, o la transición no es válida (400). */
  | { status: 'invalid' }
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
