export type AuthResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

const DEFAULT_DB_CONNECTION = 'Username-Password-Authentication';

const domain = () => {
  const issuer = process.env.AUTH0_ISSUER_BASE_URL ?? '';
  return issuer.startsWith('http') ? issuer.replace(/\/+$/, '') : `https://${issuer}`;
};
const connection = () => process.env.AUTH0_DB_CONNECTION || DEFAULT_DB_CONNECTION;

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${domain()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  return { res, text: await res.text() };
}

/**
 * Envía el mail de restablecimiento. Siempre "ok" para no revelar qué correos existen.
 *
 * NOTA: login y registro por correo NO pasan por acá ni por ningún intercambio directo de credenciales
 * (`grant_type=password`/`password-realm`) — Auth0 bloquea ese grant a nivel de plataforma para tenants
 * nuevos (la casilla "Password" en Grant Types queda marcable pero no tiene efecto: siempre devuelve
 * `access_denied`). Van por Authorization Code contra la pantalla hosteada de Auth0, igual que Google
 * (ver `core/auth/google-sign-in.ts`, `startEmailSignIn`). `change_password` sí es un endpoint público
 * sin grant, así que este sigue funcionando igual.
 */
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
