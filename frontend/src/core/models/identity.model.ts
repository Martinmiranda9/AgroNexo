// ─── Registro de usuarios (POST /api/v1/identity/register) ───────────────────

/** Coincide con `UserType` del backend. */
export const USER_TYPE = { Producer: 1, Professional: 2 } as const;
export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export type ProducerType = 'Agricola' | 'Ganadero' | 'Mixto';
export type ProfessionalRole = 'Agronomist' | 'Accountant' | 'Investor' | 'Lawyer' | 'Other';
/** Profesionales que un productor puede buscar (excluye 'Other'). */
export type SearchableRole = Exclude<ProfessionalRole, 'Other'>;
export type HectaresRange = 'Up100' | 'From100To500' | 'From500To1000' | 'From1000To5000' | 'Over5000';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RegisterUserRequest {
  userType: UserType;
  firstName: string;
  lastName: string;
  documentNumber?: string;
  /** WhatsApp en formato internacional, ej: +5493511234567. */
  phoneNumber: string;
  // Productor
  producerType?: ProducerType;
  hectaresRange?: HectaresRange;
  lookingFor?: SearchableRole[];
  country?: string;
  province?: string;
  city?: string;
  // Profesional
  role?: ProfessionalRole;
  specialty?: string;
  /** Número de matrícula (obligatorio para agrónomo, contador y abogado). */
  licenseNumber?: string;
  yearsExperience?: number;
  maxCapacity?: number;
  coverageAreaCoordinates?: Coordinate[];
}

export interface RegisterUserResponse {
  userId: string;
  publicId: number;
  tenantId: string;
  tenantName: string;
  auth0UserId: string;
  userType: UserType | keyof typeof USER_TYPE;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phoneNumber: string;
  producerType?: string;
  hectaresRange?: HectaresRange;
  lookingFor?: SearchableRole[];
  country?: string;
  province?: string;
  city?: string;
  role?: string;
  specialty?: string;
  licenseNumber?: string;
  createdAt: string;
}
