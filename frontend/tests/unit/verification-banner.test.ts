import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { resolveVerificationBannerVisibility } from '@/ui/components/verification-banner.logic';
import { checkEmailVerified, resendVerificationEmail } from '@/core/services/verify-email.service';

describe('resolveVerificationBannerVisibility', () => {
  it('nunca muestra el banner para Google, esté o no verificado', () => {
    expect(resolveVerificationBannerVisibility({ provider: 'google-oauth2', emailVerified: true })).toBe('hidden');
    expect(resolveVerificationBannerVisibility({ provider: 'google-oauth2', emailVerified: false })).toBe('hidden');
    expect(resolveVerificationBannerVisibility({ provider: 'google-oauth2' })).toBe('hidden');
  });

  it('oculta el banner mientras no se resolvió el estado (carga, 401, 503, error de red)', () => {
    expect(resolveVerificationBannerVisibility({ provider: 'auth0' })).toBe('hidden');
    expect(resolveVerificationBannerVisibility({})).toBe('hidden');
  });

  it('muestra verde cuando el correo está verificado (proveedor auth0)', () => {
    expect(resolveVerificationBannerVisibility({ provider: 'auth0', emailVerified: true })).toBe('verified');
  });

  it('muestra rojo cuando el correo no está verificado (proveedor auth0)', () => {
    expect(resolveVerificationBannerVisibility({ provider: 'auth0', emailVerified: false })).toBe('unverified');
  });
});

describe('verify-email.service', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('checkEmailVerified: normaliza una respuesta 200 en { ok: true, data }', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ emailVerified: true }), { status: 200 }),
    );

    const result = await checkEmailVerified();
    expect(result).toEqual({ ok: true, data: { emailVerified: true } });
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/verify-email', { cache: 'no-store' });
  });

  it('checkEmailVerified: un 401 (sin sesión) colapsa a { ok: false }', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response(null, { status: 401 }));

    expect(await checkEmailVerified()).toEqual({ ok: false });
  });

  it('checkEmailVerified: un 503 (Management API sin configurar) colapsa a { ok: false }', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ message: 'no configurado' }), { status: 503 }),
    );

    expect(await checkEmailVerified()).toEqual({ ok: false });
  });

  it('checkEmailVerified: un error de red colapsa a { ok: false } sin lanzar', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network down'));

    expect(await checkEmailVerified()).toEqual({ ok: false });
  });

  it('resendVerificationEmail: reenvío exitoso informa sent: true', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ emailVerified: false, sent: true }), { status: 200 }),
    );

    const result = await resendVerificationEmail();
    expect(result).toEqual({ ok: true, data: { emailVerified: false, sent: true } });
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/verify-email', { method: 'POST' });
  });

  it('resendVerificationEmail: ya verificado no reenvía nada, solo informa el estado', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ emailVerified: true }), { status: 200 }),
    );

    expect(await resendVerificationEmail()).toEqual({ ok: true, data: { emailVerified: true } });
  });
});
