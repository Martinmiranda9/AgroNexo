import { decodeJwt } from 'jose';
import type { PasswordSession } from './password-session';

export type AuthResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

const DEFAULT_DB_CONNECTION = 'Username-Password-Authentication';

const domain = () => {
  const issuer = process.env.AUTH0_ISSUER_BASE_URL ?? '';
  return issuer.startsWith('http') ? issuer.replace(/\/+$/, '') : `https://${issuer}`;
};
const connection = () => process.env.AUTH0_DB_CONNECTION || DEFAULT_DB_CONNECTION;

async function post(path: string, body: Record<string, unknown>, clientIp?: string) {
  const res = await fetch(`${domain()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Con la IP real Auth0 aplica su protección contra fuerza bruta por usuario+IP y no por servidor.
      ...(clientIp ? { 'auth0-forwarded-for': clientIp } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // respuesta sin JSON (ej: change_password devuelve texto plano)
  }
  return { res, json, text };
}

const NETWORK_ERROR = { ok: false, status: 502, message: 'No pudimos conectarnos con el servicio de acceso. Intentá de nuevo.' } as const;

/** Login con correo y contraseña (grant password-realm). Requiere habilitarlo en la app de Auth0. */
export async function loginWithPassword(
  email: string,
  password: string,
  clientIp?: string,
): Promise<AuthResult<{ session: PasswordSession; expiresIn: number }>> {
  try {
    const { res, json } = await post(
      '/oauth/token',
      {
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        username: email,
        password,
        realm: connection(),
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
      },
      clientIp,
    );

    if (!res.ok) {
      switch (json.error) {
        case 'invalid_grant':
          return { ok: false, status: 401, message: 'Correo o contraseña incorrectos.' };
        case 'too_many_attempts':
          return { ok: false, status: 429, message: 'Demasiados intentos. Esperá unos minutos o restablecé tu contraseña.' };
        case 'mfa_required':
          return { ok: false, status: 403, message: 'Tu cuenta pide verificación adicional. Entrá con Google o contactanos.' };
        case 'unauthorized_client':
        case 'unsupported_grant_type':
          console.error('Auth0: habilitá el grant "Password" en la aplicación y el directorio por defecto del tenant.', json);
          return { ok: false, status: 500, message: 'El acceso con contraseña todavía no está habilitado.' };
        default:
          console.error('Auth0 /oauth/token', res.status, json);
          return { ok: false, status: 502, message: 'No pudimos iniciar sesión. Intentá de nuevo.' };
      }
    }

    // El id_token llega directo del endpoint de Auth0 por TLS: alcanza con leer sus claims.
    const claims = decodeJwt(String(json.id_token));
    return {
      ok: true,
      data: {
        expiresIn: Number(json.expires_in) || 3600,
        session: {
          sub: String(claims.sub),
          email: claims.email as string | undefined,
          emailVerified: claims.email_verified as boolean | undefined,
          firstName: claims.given_name as string | undefined,
          lastName: claims.family_name as string | undefined,
          picture: claims.picture as string | undefined,
          accessToken: String(json.access_token),
        },
      },
    };
  } catch (err) {
    console.error('Auth0 login', err);
    return NETWORK_ERROR;
  }
}

/** Crea el usuario en la base de datos de Auth0. No inicia sesión: el llamador hace el login después. */
export async function signupWithPassword(email: string, password: string): Promise<AuthResult<null>> {
  try {
    const { res, json } = await post('/dbconnections/signup', {
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      password,
      connection: connection(),
    });
    if (res.ok) return { ok: true, data: null };

    if (json.code === 'user_exists' || json.code === 'invalid_signup') {
      return { ok: false, status: 409, message: 'Ya existe una cuenta con ese correo. Iniciá sesión.' };
    }
    if (json.name === 'PasswordStrengthError' || json.code === 'invalid_password') {
      return { ok: false, status: 400, message: 'La contraseña es muy débil: usá al menos 8 caracteres con mayúscula, minúscula y número.' };
    }
    console.error('Auth0 signup', res.status, json);
    return { ok: false, status: 502, message: 'No pudimos crear la cuenta. Intentá de nuevo.' };
  } catch (err) {
    console.error('Auth0 signup', err);
    return NETWORK_ERROR;
  }
}

/** Envía el mail de restablecimiento. Siempre "ok" para no revelar qué correos existen. */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await post('/dbconnections/change_password', {
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      connection: connection(),
    });
  } catch (err) {
    console.error('Auth0 change_password', err);
  }
}
