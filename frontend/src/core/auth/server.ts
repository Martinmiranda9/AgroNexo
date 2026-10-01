import { cookies } from 'next/headers';
import { API_ORIGIN } from '@/core/config/api';
import { SESSION_COOKIE, isFirebaseConfigured } from './config';
import { verifyFirebaseIdToken } from './firebase-verify';

/** Datos de la identidad que Firebase ya conoce, para prellenar el registro. */
export interface SessionUser {
  /** `sub` del token de Firebase: el UID del usuario. */
  id: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  picture?: string;
  /** `google.com` si entró con Google; `password` si entró con correo y contraseña. */
  provider: string;
}

export interface CurrentUser {
  isRegistered: boolean;
  /** El backend serializa el enum `UserType` como string (`JsonStringEnumConverter`): `'Producer' | 'Professional'`. */
  userType?: string;
  publicId?: number;
  firstName?: string;
}

function splitName(name?: string): { firstName?: string; lastName?: string } {
  if (!name) return {};
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') || undefined };
}

/** Sesión actual o `null` (sin login, cookie vencida/inválida, o Firebase sin configurar). */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isFirebaseConfigured()) return null;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyFirebaseIdToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    ...splitName(payload.name),
    picture: payload.picture,
    provider: payload.firebase?.sign_in_provider ?? 'password',
  };
}

/** ID token para el backend, o `undefined` si no hay sesión. Es el mismo valor que guarda la cookie. */
export async function getBackendToken(): Promise<string | undefined> {
  if (!isFirebaseConfigured()) return undefined;
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/**
 * Estado de registro del usuario logueado. `unavailable` (backend caído, sin red, token rechazado) es
 * distinto de `not-registered`: sin esa diferencia un corte del servidor mandaría a todos al onboarding.
 */
export type CurrentUserState =
  | { status: 'registered'; user: CurrentUser }
  | { status: 'not-registered' }
  | { status: 'unavailable' };

/** Consulta al backend si el usuario logueado ya completó el registro (`GET /identity/me`). */
export async function fetchCurrentUser(): Promise<CurrentUserState> {
  const token = await getBackendToken();
  if (!token) return { status: 'unavailable' };

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/identity/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    // El backend responde 200 con `isRegistered: false` para una identidad nueva; cualquier otra cosa es un fallo.
    if (!res.ok) return { status: 'unavailable' };

    const user = (await res.json()) as CurrentUser;
    return user.isRegistered ? { status: 'registered', user } : { status: 'not-registered' };
  } catch {
    return { status: 'unavailable' };
  }
}
