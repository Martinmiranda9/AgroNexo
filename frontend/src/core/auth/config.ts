/** Ruta a la que vuelve Auth0 tras autenticar: decide entre onboarding y aplicación. */
export const AUTH_CONTINUE_PATH = '/auth/continue';

/** Página final del popup de Google: avisa a la ventana principal y se cierra. */
export const AUTH_POPUP_COMPLETE_PATH = '/auth/popup-complete';

/** Conexiones de Auth0 que el frontend puede pedir por URL. Cualquier otra se ignora. */
export const AUTH_CONNECTIONS = { google: 'google-oauth2' } as const;

const REQUIRED_ENV = [
  'AUTH0_SECRET',
  'AUTH0_BASE_URL',
  'AUTH0_ISSUER_BASE_URL',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_AUDIENCE',
] as const;

/**
 * Auth0 está listo cuando están todas las variables de entorno. Sin ellas (desarrollo local
 * sin tenant) la app mantiene el registro con token de desarrollo en vez de romperse.
 */
export function isAuth0Configured(): boolean {
  return REQUIRED_ENV.every((name) => Boolean(process.env[name]));
}

/** Solo rutas internas: evita que `returnTo` sirva de redirección abierta (`//evil.com`, `/\evil.com`). */
export function safeReturnTo(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return undefined;
  return value;
}

/** Arma la URL de login/registro de Auth0. `connection: 'google'` salta la pantalla de Auth0 y abre Google. */
export function buildAuthUrl(options: {
  connection?: keyof typeof AUTH_CONNECTIONS;
  signup?: boolean;
  email?: string;
  returnTo?: string;
}): string {
  const params = new URLSearchParams({ returnTo: options.returnTo ?? AUTH_CONTINUE_PATH });
  if (options.connection) params.set('connection', AUTH_CONNECTIONS[options.connection]);
  if (options.signup) params.set('screen_hint', 'signup');
  if (options.email) params.set('login_hint', options.email);
  return `/api/auth/login?${params}`;
}
