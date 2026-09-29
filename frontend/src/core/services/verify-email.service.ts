/**
 * Cliente para `app/api/auth/verify-email/route.ts` (GET consulta, POST reenvía). La ruta ya resuelve
 * sesión y Management API de Auth0 en el servidor; acá solo se normaliza la respuesta para el banner:
 * cualquier error (401 sin sesión, 503 Management API sin configurar, 502 de Auth0, red caída) colapsa
 * a `{ ok: false }`, un estado neutral que el llamador debe tratar como "no mostrar nada".
 */

export interface VerifyEmailStatus {
  emailVerified: boolean;
}

export interface ResendVerificationStatus {
  emailVerified: boolean;
  /** `true` cuando efectivamente se reenvió el mail (si ya estaba verificado no hace falta). */
  sent?: boolean;
}

export type VerifyEmailResult<T> = { ok: true; data: T } | { ok: false };

async function parseResult<T>(response: Response): Promise<VerifyEmailResult<T>> {
  if (!response.ok) return { ok: false };
  try {
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false };
  }
}

/** `GET /api/auth/verify-email`: estado real de `email_verified` en Auth0. */
export async function checkEmailVerified(): Promise<VerifyEmailResult<VerifyEmailStatus>> {
  try {
    const response = await fetch('/api/auth/verify-email', { cache: 'no-store' });
    return await parseResult<VerifyEmailStatus>(response);
  } catch {
    return { ok: false };
  }
}

/** `POST /api/auth/verify-email`: reenvía el mail (o informa que ya estaba verificado). */
export async function resendVerificationEmail(): Promise<VerifyEmailResult<ResendVerificationStatus>> {
  try {
    const response = await fetch('/api/auth/verify-email', { method: 'POST' });
    return await parseResult<ResendVerificationStatus>(response);
  } catch {
    return { ok: false };
  }
}
