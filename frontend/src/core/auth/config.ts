/** Ruta a la que vuelve tras autenticar: decide entre onboarding y aplicación. */
export const AUTH_CONTINUE_PATH = '/auth/continue';

/** Cookie httpOnly con el ID token de Firebase (ver `app/api/auth/session/route.ts`). */
export const SESSION_COOKIE = 'agronexo_session';

const REQUIRED_ENV = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

/**
 * Firebase está listo cuando están todas las variables de entorno. Sin ellas (desarrollo local
 * sin proyecto configurado) la app mantiene el registro con token de desarrollo en vez de romperse.
 */
export function isFirebaseConfigured(): boolean {
  return REQUIRED_ENV.every((name) => Boolean(process.env[name]));
}

/** Solo rutas internas: evita que `returnTo` sirva de redirección abierta (`//evil.com`, `/\evil.com`). */
export function safeReturnTo(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return undefined;
  return value;
}
