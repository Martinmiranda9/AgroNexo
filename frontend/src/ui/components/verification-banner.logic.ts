/**
 * Lógica pura de decisión del `VerificationBanner`: sin red ni React, para poder testearla directo.
 */

export type VerificationBannerVisibility = 'hidden' | 'verified' | 'unverified';

export interface ResolveVerificationBannerArgs {
  /** `sign_in_provider` del token de Firebase (`google.com` o `password`). Sin sesión: `undefined`. */
  provider?: string;
  /** `emailVerified` del usuario de Firebase. `undefined` cubre carga en curso y sin sesión: estado neutral. */
  emailVerified?: boolean;
}

const GOOGLE_PROVIDER = 'google.com';

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
