import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Verifica un ID token de Firebase del lado del servidor, sin el SDK de Admin (que exigiría una cuenta
 * de servicio). Firebase firma sus tokens con RS256 y publica las claves públicas en un JWKS fijo:
 * alcanza con validar firma, emisor y audiencia, igual que hace el backend en .NET.
 */
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

export interface FirebaseTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  firebase?: { sign_in_provider?: string };
}

function projectId(): string {
  const id = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!id) throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID no está configurado.');
  return id;
}

/** `null` si el token está vencido, mal firmado, o no es de este proyecto. */
export async function verifyFirebaseIdToken(token: string): Promise<FirebaseTokenPayload | null> {
  try {
    const id = projectId();
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${id}`,
      audience: id,
    });
    if (typeof payload.sub !== 'string') return null;
    return payload as unknown as FirebaseTokenPayload;
  } catch {
    return null;
  }
}
