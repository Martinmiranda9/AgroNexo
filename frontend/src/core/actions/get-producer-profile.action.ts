'use server';

import { API_ORIGIN } from '@/core/config/api';
import { getBackendToken } from '@/core/auth/server';
import type { ProducerProfile } from '@/core/models/producer.model';

/** Perfil del productor logueado (`GET /api/v1/producers/me`), o `null` si no se pudo leer. */
export async function getProducerProfileAction(): Promise<ProducerProfile | null> {
  const token = await getBackendToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/producers/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return res.ok ? ((await res.json()) as ProducerProfile) : null;
  } catch {
    return null;
  }
}
