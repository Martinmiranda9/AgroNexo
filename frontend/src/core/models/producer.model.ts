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
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
