// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginWithPassword, signupWithPassword } from '@/core/auth/auth0-password';

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** id_token sin firma real: el código solo lee sus claims. */
const idToken = (claims: object) => `x.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.y`;

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('AUTH0_ISSUER_BASE_URL', 'https://tenant.us.auth0.com');
  vi.stubEnv('AUTH0_CLIENT_ID', 'client-id');
  vi.stubEnv('AUTH0_CLIENT_SECRET', 'client-secret');
  vi.stubEnv('AUTH0_AUDIENCE', 'https://api.example.com');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('loginWithPassword', () => {
  it('devuelve la sesión y manda el realm, la audience y la IP del cliente', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        access_token: 'access.jwt',
        expires_in: 86400,
        id_token: idToken({ sub: 'auth0|1', email: 'a@b.com', email_verified: false }),
      }),
    );

    const result = await loginWithPassword('a@b.com', 'Secreta123', '190.1.2.3');

    expect(result).toEqual({
      ok: true,
      data: {
        expiresIn: 86400,
        session: { sub: 'auth0|1', email: 'a@b.com', emailVerified: false, firstName: undefined, lastName: undefined, picture: undefined, accessToken: 'access.jwt' },
      },
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://tenant.us.auth0.com/oauth/token');
    expect(init.headers['auth0-forwarded-for']).toBe('190.1.2.3');
    expect(JSON.parse(init.body)).toMatchObject({
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      realm: 'Username-Password-Authentication',
      audience: 'https://api.example.com',
    });
  });

  it('traduce credenciales inválidas a 401 sin filtrar detalles', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'invalid_grant', error_description: 'Wrong email or password.' }, 403));

    expect(await loginWithPassword('a@b.com', 'mal')).toEqual({ ok: false, status: 401, message: 'Correo o contraseña incorrectos.' });
  });

  it('traduce el bloqueo por intentos a 429', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'too_many_attempts' }, 429));

    expect(await loginWithPassword('a@b.com', 'mal')).toMatchObject({ ok: false, status: 429 });
  });

  it('avisa cuando el grant Password no está habilitado en Auth0', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'unauthorized_client' }, 403));

    expect(await loginWithPassword('a@b.com', 'x')).toMatchObject({ ok: false, status: 500 });
  });

  it('responde 502 si Auth0 no está disponible', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    expect(await loginWithPassword('a@b.com', 'x')).toMatchObject({ ok: false, status: 502 });
  });
});

describe('signupWithPassword', () => {
  it('crea el usuario en la base de datos de Auth0', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ _id: '1', email: 'a@b.com' }));

    expect(await signupWithPassword('a@b.com', 'Secreta123')).toEqual({ ok: true, data: null });
    expect(fetchMock.mock.calls[0][0]).toBe('https://tenant.us.auth0.com/dbconnections/signup');
  });

  it('informa cuando el correo ya tiene cuenta', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'invalid_signup', name: 'BadRequestError' }, 400));

    expect(await signupWithPassword('a@b.com', 'Secreta123')).toMatchObject({ ok: false, status: 409 });
  });

  it('informa cuando la contraseña es débil', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'invalid_password', name: 'PasswordStrengthError' }, 400));

    expect(await signupWithPassword('a@b.com', '123')).toMatchObject({ ok: false, status: 400 });
  });
});
