import { NextResponse, type NextRequest } from 'next/server';
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { AUTH_CONNECTIONS, AUTH_CONTINUE_PATH, isAuth0Configured } from '@/core/auth/config';
import { CLEAR_PASSWORD_SESSION_HEADER } from '@/core/auth/password-session';

const ALLOWED_CONNECTIONS: ReadonlySet<string> = new Set(Object.values(AUTH_CONNECTIONS));

/**
 * /api/auth/login?connection=google-oauth2  → abre Google directo (sin pantalla intermedia).
 * /api/auth/login?screen_hint=signup        → Universal Login en la pestaña de registro.
 * /api/auth/login?login_hint=a@b.com        → Universal Login con el correo ya cargado.
 */
const auth = handleAuth({
  login: handleLogin((req) => {
    const params = (req as NextRequest).nextUrl.searchParams;
    const connection = params.get('connection');
    const screenHint = params.get('screen_hint');
    const loginHint = params.get('login_hint');

    return {
      returnTo: AUTH_CONTINUE_PATH,
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email',
        ...(connection && ALLOWED_CONNECTIONS.has(connection) ? { connection } : {}),
        ...(screenHint === 'signup' ? { screen_hint: 'signup' } : {}),
        ...(loginHint ? { login_hint: loginHint } : {}),
      },
    };
  }),
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
