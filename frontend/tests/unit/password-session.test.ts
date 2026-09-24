// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { sealSession, unsealSession, type PasswordSession } from '@/core/auth/password-session';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));

const SECRET = 'test-secret-with-more-than-32-characters!!';
const session: PasswordSession = {
  sub: 'auth0|abc123',
  email: 'productor@example.com',
  emailVerified: true,
  accessToken: 'header.payload.signature',
};

describe('sesión de correo y contraseña', () => {
  it('cifra y recupera la sesión', async () => {
    const token = await sealSession(session, 3600, SECRET);

    expect(token).not.toContain('productor@example.com');
    expect(token).not.toContain('header.payload.signature');
    expect(await unsealSession(token, SECRET)).toEqual({ ...session, firstName: undefined, lastName: undefined, picture: undefined });
  });

  it('rechaza una cookie alterada', async () => {
    const token = await sealSession(session, 3600, SECRET);
    const tampered = `${token.slice(0, -4)}AAAA`;

    expect(await unsealSession(tampered, SECRET)).toBeNull();
  });

  it('rechaza una cookie cifrada con otro secreto', async () => {
    const token = await sealSession(session, 3600, 'otro-secreto-distinto-de-mas-de-32-chars');

    expect(await unsealSession(token, SECRET)).toBeNull();
  });

  it('rechaza una sesión vencida', async () => {
    vi.useFakeTimers();
    try {
      const token = await sealSession(session, 60, SECRET);
      vi.advanceTimersByTime(120_000);

      expect(await unsealSession(token, SECRET)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
