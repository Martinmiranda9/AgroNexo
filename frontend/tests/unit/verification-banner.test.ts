import { describe, expect, it } from 'vitest';
import { resolveVerificationBannerVisibility } from '@/ui/components/verification-banner.logic';

describe('resolveVerificationBannerVisibility', () => {
  it('nunca muestra el banner para Google, esté o no verificado', () => {
    expect(resolveVerificationBannerVisibility({ provider: 'google.com', emailVerified: true })).toBe('hidden');
    expect(resolveVerificationBannerVisibility({ provider: 'google.com', emailVerified: false })).toBe('hidden');
    expect(resolveVerificationBannerVisibility({ provider: 'google.com' })).toBe('hidden');
  });

  it('oculta el banner mientras no se resolvió el estado (carga o sin sesión)', () => {
    expect(resolveVerificationBannerVisibility({ provider: 'password' })).toBe('hidden');
    expect(resolveVerificationBannerVisibility({})).toBe('hidden');
  });

  it('muestra verde cuando el correo está verificado (proveedor password)', () => {
    expect(resolveVerificationBannerVisibility({ provider: 'password', emailVerified: true })).toBe('verified');
  });

  it('muestra rojo cuando el correo no está verificado (proveedor password)', () => {
    expect(resolveVerificationBannerVisibility({ provider: 'password', emailVerified: false })).toBe('unverified');
  });
});
