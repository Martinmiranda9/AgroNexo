import type { ProfessionalRole } from './identity.model';

/** Punto del mapa en WGS84 (`CoordinateDto`). */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** Contacto de alguien del campo. Llega solo a quien ya tiene un match aceptado con esa persona. */
export interface FarmContact {
  /** Formato internacional (E.164): `+5491155550000`. */
  phoneNumber: string;
  email: string | null;
}

/** Profesional del equipo de un campo (`FarmMemberResponse`). */
export interface FarmMember {
  id: string;
  professionalId: string;
  publicId: number;
  firstName: string;
  lastName: string;
  role: ProfessionalRole;
  specialty: string;
  licenseNumber: string | null;
  isVerified: boolean;
  joinedAt: string;
  /** Solo para el productor dueño; entre profesionales del mismo campo no se comparte. */
  contact: FarmContact | null;
}

/** Un campo visto como espacio de trabajo (`WorkspaceResponse`), por el productor dueño o un profesional del equipo. */
export interface Workspace {
  farmId: string;
  /** ID legible del campo: 200001. */
  publicId: number;
  name: string;
  description: string | null;
  totalHectares: number;
  createdAt: string;
  /** Fecha en que se archivó; `null` mientras está en uso. */
  archivedAt: string | null;
  /** Perímetro dibujado en el mapa (anillo cerrado: el último punto repite el primero). Vacío si no tiene. */
  locationCoordinates?: GeoPoint[];
  /** Provincia, partido y localidad sacados del perímetro; `null` si no hay perímetro. */
  province?: string | null;
  department?: string | null;
  locality?: string | null;
  producerId: string;
  producerName: string;
  /** `Owner`: mira el productor dueño. `Member`: mira un profesional del equipo. */
  viewerRole: 'Owner' | 'Member';
  myMemberId: string | null;
  /** Contacto del productor: solo para los profesionales del equipo (y solo en el detalle). */
  producerContact: FarmContact | null;
  /** Equipo activo, en orden de llegada. */
  members: FarmMember[];
}

/** Profesional con match aceptado que el productor puede sumar a un campo (`FarmCandidateResponse`). */
export interface FarmCandidate {
  professionalId: string;
  publicId: number;
  firstName: string;
  lastName: string;
  role: ProfessionalRole;
  specialty: string;
  licenseNumber: string | null;
  isVerified: boolean;
  yearsExperience: number;
  /** Cuándo aceptó el match. */
  matchedAt: string | null;
}

/** Mismos límites que `CreateFarmRequest` en el backend. */
export const FARM_NAME_MIN = 2;
export const FARM_NAME_MAX = 200;
export const FARM_DESCRIPTION_MAX = 500;
export const FARM_HECTARES_MAX = 1_000_000;

/** Datos para crear un campo. */
export interface CreateFarmInput {
  name: string;
  description?: string;
  /** Opcional: 0 si no se sabe todavía. El perímetro dibujado no las cambia. */
  totalHectares?: number;
  /** Perímetro dibujado en el mapa, solo para ubicar el campo (opcional, al menos 3 esquinas). */
  locationCoordinates?: GeoPoint[];
}

/** Campo recién creado: lo justo para seguir con la invitación. */
export interface CreatedFarm {
  id: string;
  publicId: number;
  name: string;
}

export type GetWorkspacesResult =
  | { status: 'ok'; workspaces: Workspace[] }
  | { status: 'unauthorized' }
  | { status: 'unavailable' };

export type CreateFarmResult =
  | { status: 'created'; farm: CreatedFarm }
  /** Nombre o descripción fuera de las reglas del backend (400). */
  | { status: 'invalid' }
  | { status: 'unauthorized' }
  /** La cuenta no es de productor. */
  | { status: 'forbidden' }
  | { status: 'unavailable' };

export type GetFarmCandidatesResult =
  | { status: 'ok'; candidates: FarmCandidate[] }
  | { status: 'not-found' }
  | { status: 'unauthorized' }
  | { status: 'unavailable' };

export type AddFarmMemberResult =
  | { status: 'added'; member: FarmMember }
  /** Ya estaba en el equipo (409). */
  | { status: 'conflict' }
  /** Sin match aceptado, o el campo está archivado (400). */
  | { status: 'invalid' }
  | { status: 'not-found' }
  | { status: 'unauthorized' }
  | { status: 'unavailable' };
