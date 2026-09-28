import { NextResponse, type NextRequest } from 'next/server';
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import {
  AUTH_CONNECTIONS,
  AUTH_CONTINUE_PATH,
  AUTH_POPUP_COMPLETE_PATH,
  isAuth0Configured,
  safeReturnTo,
} from '@/core/auth/config';
import { CLEAR_PASSWORD_SESSION_HEADER } from '@/core/auth/password-session';

const ALLOWED_CONNECTIONS: ReadonlySet<string> = new Set(Object.values(AUTH_CONNECTIONS));

/**
 * /api/auth/login?connection=google-oauth2  → abre Google directo (sin pantalla intermedia).
 * /api/auth/login?screen_hint=signup        → Universal Login en la pestaña de registro.
 * /api/auth/login?login_hint=a@b.com        → Universal Login con el correo ya cargado.
 * /api/auth/login?returnTo=/ruta             → adónde vuelve tras autenticar (solo rutas internas).
 *
 * El popup de Google usa `returnTo=/auth/popup-complete`. Si Auth0 falla (ej: el usuario cancela en Google),
 * también se termina ahí con `?error=`, para que la ventana avise y se cierre en vez de mostrar un JSON.
 */
const auth = handleAuth({
  login: handleLogin((req) => {
    const params = (req as NextRequest).nextUrl.searchParams;
    const connection = params.get('connection');
    const screenHint = params.get('screen_hint');
    const loginHint = params.get('login_hint');

    return {
      returnTo: safeReturnTo(params.get('returnTo')) ?? AUTH_CONTINUE_PATH,
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email',
        ...(connection && ALLOWED_CONNECTIONS.has(connection) ? { connection } : {}),
        ...(screenHint === 'signup' ? { screen_hint: 'signup' } : {}),
        ...(loginHint ? { login_hint: loginHint } : {}),
      },
    };
  }),
  onError(req: NextRequest, error: Error) {
    console.error('Auth0', error);
    const code = /access_denied/i.test(String(error?.message)) ? 'access_denied' : 'auth_failed';
    return NextResponse.redirect(new URL(`${AUTH_POPUP_COMPLETE_PATH}?error=${code}`, req.url));
  },
});

type RouteContext = { params: Promise<{ auth0: string }> };

// Next 15 entrega `params` como Promise y el SDK (v3) espera el objeto ya resuelto.
export async function GET(req: NextRequest, ctx: RouteContext) {
  if (!isAuth0Configured()) {
    return NextResponse.redirect(new URL('/login?error=auth_not_configured', req.url));
  }

  const params = await ctx.params;
  const res = await auth(req, { params });

  // Además de la sesión de Auth0 (Google), el logout borra la del formulario de correo y contraseña.
  if (params.auth0 === 'logout' && res instanceof Response) {
    res.headers.append('Set-Cookie', CLEAR_PASSWORD_SESSION_HEADER);
  }
  return res;
}
