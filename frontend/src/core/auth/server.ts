import { getAccessToken, getSession } from '@auth0/nextjs-auth0';
import { API_ORIGIN } from '@/core/config/api';
import { isAuth0Configured } from './config';
import { readPasswordSession } from './password-session';

/** Datos de la identidad que Google/Auth0 ya conocen, para prellenar el registro. */
export interface SessionUser {
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  picture?: string;
  /** `google-oauth2` si entró con Google; `auth0` si entró con email y contraseña. */
  provider: string;
}

export interface CurrentUser {
  isRegistered: boolean;
  userType?: number;
  publicId?: number;
  firstName?: string;
}

/** Sesión actual o `null` (sin login, o Auth0 sin configurar). */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isAuth0Configured()) return null;

  // Sesión del formulario propio (correo y contraseña) o, si no hay, la de Google vía Auth0.
  const own = await readPasswordSession();
  if (own) {
    return {
      email: own.email,
      emailVerified: own.emailVerified,
      firstName: own.firstName,
      lastName: own.lastName,
      picture: own.picture,
      provider: own.sub.split('|')[0] || 'auth0',
    };
  }

  const session = await getSession();
  const user = session?.user;
  if (!user) return null;

  // Con email/contraseña Auth0 no separa nombre y apellido: solo Google los trae.
  return {
    email: user.email,
    emailVerified: user.email_verified,
    firstName: user.given_name,
    lastName: user.family_name,
    picture: user.picture,
    provider: String(user.sub ?? '').split('|')[0] || 'auth0',
  };
}

/** Access token para el backend, o `undefined` si no hay sesión. */
export async function getBackendToken(): Promise<string | undefined> {
  if (!isAuth0Configured()) return undefined;

  const own = await readPasswordSession();
  if (own) return own.accessToken;

  try {
    const { accessToken } = await getAccessToken();
    return accessToken;
  } catch {
    return undefined;
  }
}

/** Consulta al backend si el usuario logueado ya completó el registro. `null` si no se pudo saber. */
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const token = await getBackendToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/identity/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return res.ok ? ((await res.json()) as CurrentUser) : null;
  } catch {
    return null;
  }
}
