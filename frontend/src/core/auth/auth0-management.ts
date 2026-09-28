import type { AuthResult } from './auth0-password';

/**
 * Verificación de correo vía Management API de Auth0. Necesita una aplicación M2M con el scope
 * `update:users` (y `read:users` para consultar el estado); sus credenciales viven solo en el servidor:
 *   AUTH0_MGMT_CLIENT_ID / AUTH0_MGMT_CLIENT_SECRET
 * Sin ellas todo devuelve 503 y el resto de la app sigue funcionando: Auth0 igual envía el mail de
 * verificación al crear el usuario con correo y contraseña; esto solo agrega "reenviar" y "ya verifiqué".
 */

const domain = () => {
  const issuer = process.env.AUTH0_ISSUER_BASE_URL ?? '';
  return issuer.startsWith('http') ? issuer.replace(/\/+$/, '') : `https://${issuer}`;
};

export const isManagementConfigured = () =>
  Boolean(process.env.AUTH0_MGMT_CLIENT_ID && process.env.AUTH0_MGMT_CLIENT_SECRET);

const NOT_CONFIGURED = { ok: false, status: 503, message: 'La verificación de correo todavía no está configurada.' } as const;
const UNAVAILABLE = { ok: false, status: 502, message: 'No pudimos comunicarnos con el servicio de acceso. Intentá de nuevo.' } as const;

let cachedToken: { value: string; expiresAt: number } | undefined;

async function managementToken(): Promise<string | undefined> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const res = await fetch(`${domain()}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: `${domain()}/api/v2/`,
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('Auth0 management token', res.status);
    return undefined;
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.value;
}

/** Reenvía el mail de verificación. Los usuarios de Google ya vienen verificados y no lo necesitan. */
export async function resendVerificationEmail(userId: string): Promise<AuthResult<null>> {
  if (!isManagementConfigured()) return NOT_CONFIGURED;
  try {
    const token = await managementToken();
    if (!token) return UNAVAILABLE;

    const res = await fetch(`${domain()}/api/v2/jobs/verification-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('Auth0 verification-email', res.status);
      return UNAVAILABLE;
    }
    return { ok: true, data: null };
  } catch (err) {
    console.error('Auth0 verification-email', err);
    return UNAVAILABLE;
  }
}

/**
 * Estado real de `email_verified`. El de la cookie de sesión queda viejo hasta el próximo login,
 * por eso "Ya verifiqué" consulta acá.
 */
export async function fetchEmailVerified(userId: string): Promise<AuthResult<{ emailVerified: boolean }>> {
  if (!isManagementConfigured()) return NOT_CONFIGURED;
  try {
    const token = await managementToken();
    if (!token) return UNAVAILABLE;

    const res = await fetch(`${domain()}/api/v2/users/${encodeURIComponent(userId)}?fields=email_verified&include_fields=true`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('Auth0 get user', res.status);
      return UNAVAILABLE;
    }
    const json = (await res.json()) as { email_verified?: boolean };
    return { ok: true, data: { emailVerified: Boolean(json.email_verified) } };
  } catch (err) {
    console.error('Auth0 get user', err);
    return UNAVAILABLE;
  }
}
