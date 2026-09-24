import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { EncryptJWT, jwtDecrypt } from 'jose';

/**
 * Sesión de quienes entran con correo y contraseña en el formulario propio.
 * La librería de Auth0 solo crea sesión desde su redirección (Google), así que acá va una cookie
 * aparte: cifrada (A256GCM), httpOnly y con la misma vigencia que el access token.
 * No guarda la contraseña ni el refresh token.
 */
export const PASSWORD_SESSION_COOKIE = 'agronexo_session';

export interface PasswordSession {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  picture?: string;
  accessToken: string;
}

const key = (secret: string) => createHash('sha256').update(secret).digest();

function requireSecret(secret = process.env.AUTH0_SECRET): string {
  if (!secret) throw new Error('AUTH0_SECRET no está configurado.');
  return secret;
}

export async function sealSession(session: PasswordSession, ttlSeconds: number, secret?: string): Promise<string> {
  return new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${Math.max(1, Math.floor(ttlSeconds))}s`)
    .encrypt(key(requireSecret(secret)));
}

/** `null` si la cookie está alterada, vencida o cifrada con otro secreto. */
export async function unsealSession(token: string, secret?: string): Promise<PasswordSession | null> {
  try {
    const { payload } = await jwtDecrypt(token, key(requireSecret(secret)));
    if (typeof payload.sub !== 'string' || typeof payload.accessToken !== 'string') return null;
    return {
      sub: payload.sub,
      email: payload.email as string | undefined,
      emailVerified: payload.emailVerified as boolean | undefined,
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      picture: payload.picture as string | undefined,
      accessToken: payload.accessToken,
    };
  } catch {
    return null;
  }
}

export async function readPasswordSession(): Promise<PasswordSession | null> {
  const token = (await cookies()).get(PASSWORD_SESSION_COOKIE)?.value;
  return token ? unsealSession(token) : null;
}

export async function writePasswordSession(session: PasswordSession, ttlSeconds: number): Promise<void> {
  (await cookies()).set(PASSWORD_SESSION_COOKIE, await sealSession(session, ttlSeconds), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(ttlSeconds),
  });
}

/** Header `Set-Cookie` que borra la sesión (para respuestas armadas a mano, como el logout). */
export const CLEAR_PASSWORD_SESSION_HEADER = `${PASSWORD_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
