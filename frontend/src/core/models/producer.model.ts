// ─── Modelos del productor ────────────────────────────────────────────────────

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
  /** Roles que el productor dijo buscar al registrarse. */
  lookingFor?: string[];
  country?: string;
  province?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
