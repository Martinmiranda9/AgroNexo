// ─── Modelos del productor ────────────────────────────────────────────────────

export type ProducerType = 'Agricola' | 'Ganadero' | 'Mixto';

/** Número entero que representa UserType.Producer en el backend. */
export const PRODUCER_USER_TYPE = 1 as const;

// ─── Request / Response para registro ─────────────────────────────────────────

export interface RegisterProducerRequest {
  /** Siempre 1 (Producer) para este formulario. */
  userType: typeof PRODUCER_USER_TYPE;
  firstName: string;
  lastName: string;
  documentNumber?: string;
  producerType?: ProducerType;
  country?: string;
  province?: string;
  city?: string;
}

export interface RegisterUserResponse {
  userId: string;
  publicId: number;
  tenantId: string;
  tenantName: string;
  auth0UserId: string;
  userType: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  producerType?: string;
  country?: string;
  province?: string;
  city?: string;
  role?: string;
  specialty?: string;
  createdAt: string;
}

// ─── Perfil completo (GET /api/v1/producers/me) ───────────────────────────────

export interface ProducerProfile {
  id: string;
  publicId: number;
  tenantId: string;
  auth0UserId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  producerType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
