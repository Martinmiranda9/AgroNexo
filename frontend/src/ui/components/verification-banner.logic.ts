/**
 * Lógica pura de decisión del `VerificationBanner`: sin red ni React, para poder testearla directo.
 */

export type VerificationBannerVisibility = 'hidden' | 'verified' | 'unverified';

export interface ResolveVerificationBannerArgs {
  /** `sub` de Auth0 partido por `|` (`google-oauth2` o `auth0`). Sin sesión: `undefined`. */
  provider?: string;
  /**
   * Estado real de `email_verified` en Auth0. `undefined` cubre carga en curso, 401 (sin sesión),
   * 503 (Management API sin configurar) y cualquier otro error: todos son un estado neutral.
   */
  emailVerified?: boolean;
}

const GOOGLE_PROVIDER = 'google-oauth2';

/**
 * - Google siempre viene verificado: el banner nunca se muestra para ese proveedor.
 * - `emailVerified` sin resolver es neutral, no un fallo: tampoco se muestra.
 * - Con un valor real, verde si está verificado, rojo si no.
 */
export function resolveVerificationBannerVisibility({
  provider,
  emailVerified,
}: ResolveVerificationBannerArgs): VerificationBannerVisibility {
  if (provider === GOOGLE_PROVIDER) return 'hidden';
  if (emailVerified === undefined) return 'hidden';
  return emailVerified ? 'verified' : 'unverified';
}
