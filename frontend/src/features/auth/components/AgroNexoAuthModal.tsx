'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { CircleNotch, EnvelopeSimple, Eye, EyeSlash, LockSimple, WarningCircle } from '@phosphor-icons/react';
import BrandMark from '@/ui/components/BrandMark';
import { AUTH_CONTINUE_PATH, buildAuthUrl } from '@/core/auth/config';
import BrandShowcasePanel from './BrandShowcasePanel';

// ─────────────────────────────────────────────────────────────────────────────
// AGRONEXO BRAND SYSTEM — PINE & BEIGE PALETTE (60-30-10)
// 60% Canvas & Surfaces: Beige (#fef7e5) & Card Ivory (#FFFBF0)
// 30% Structure & High Contrast Text: Pine (#00311e) → máximo contraste sobre Beige
// 10% Accents & Details: Olive (#4D694E) & Sage (#728141)
// ─────────────────────────────────────────────────────────────────────────────

export type AuthMode = 'login' | 'signup';

const COPY: Record<AuthMode, { title: string; subtitle: string; emailCta: string; footerText: string; footerLink: string; footerHref: string }> = {
  login: {
    title: 'Bienvenido a AgroNexo',
    subtitle: 'Iniciá sesión para gestionar tus establecimientos y asesoramientos.',
    emailCta: 'Iniciar sesión',
    footerText: '¿Todavía no tenés una cuenta?',
    footerLink: 'Crear una',
    footerHref: '/onboarding',
  },
  signup: {
    title: 'Empezá con AgroNexo',
    subtitle: 'Creá tu cuenta con tu correo o con Google. Después te pedimos los datos de tu campo o de tu perfil profesional.',
    emailCta: 'Crear cuenta',
    footerText: '¿Ya tenés una cuenta?',
    footerLink: 'Iniciá sesión',
    footerHref: '/login',
  },
};

const ERROR_MESSAGES: Record<string, string> = {
  auth_not_configured: 'El acceso todavía no está configurado en este entorno.',
  access_denied: 'No pudimos completar el acceso. Probá de nuevo.',
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Entrada única de acceso, todo en la primera pantalla:
 *  - Correo y contraseña: se validan contra Auth0 desde nuestro servidor (la contraseña no se guarda).
 *  - Google: abre directo la ventana de Google para elegir la cuenta y vuelve a la app ya logueado.
 */
export default function AgroNexoAuthModal({ mode = 'login', error }: { mode?: AuthMode; error?: string }) {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const copy = COPY[mode];
  const signup = mode === 'signup';
  const errorMessage =
    formError ?? (error ? (ERROR_MESSAGES[error] ?? 'Ocurrió un error al ingresar. Probá de nuevo.') : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(undefined);
    try {
      const res = await fetch(`/api/auth/password/${signup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json().catch(() => ({}))) as { next?: string; message?: string };
      if (!res.ok) {
        setFormError(body.message ?? 'No pudimos completar el acceso. Probá de nuevo.');
        setSubmitting(false);
        return;
      }
      // Navegación completa: las páginas del servidor leen la cookie de sesión recién creada.
      window.location.assign(body.next ?? AUTH_CONTINUE_PATH);
    } catch {
      setFormError('No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#FFFBF0] text-[#00311e] md:flex-row">
      <section className="flex min-h-[100dvh] w-full flex-col px-8 pb-8 pt-10 sm:px-12 md:w-[46%] md:px-14 lg:px-20">
        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center text-center">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              href="/"
              className="mb-6 block h-14 w-14 rounded-2xl shadow-2xs"
              aria-label="AgroNexo — Inicio"
            >
              <BrandMark variant="light" tile className="h-full w-full" />
            </Link>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#00311e] sm:text-[32px]">
              {copy.title}
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#4D694E]">{copy.subtitle}</p>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-[#8C4A34]/30 bg-[#8C4A34]/5 px-3.5 py-3 text-[13px] text-[#8C4A34]"
            >
              <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={emailId} className="text-[13px] font-medium text-[#00311e]">
                Correo
              </label>
              <div className="relative">
                <EnvelopeSimple
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#978A56]"
                  weight="regular"
                />
                <input
                  id={emailId}
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#00311e]/15 bg-[#fef7e5] pl-10 pr-4 text-[14px] text-[#00311e] outline-none transition-colors placeholder:text-[#978A56] focus:border-[#00311e] focus:ring-1 focus:ring-[#00311e]/10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={passwordId} className="text-[13px] font-medium text-[#00311e]">
                Contraseña
              </label>
              <div className="relative">
                <LockSimple
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#978A56]"
                  weight="regular"
                />
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={signup ? 8 : undefined}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                  placeholder={signup ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#00311e]/15 bg-[#fef7e5] pl-10 pr-11 text-[14px] text-[#00311e] outline-none transition-colors placeholder:text-[#978A56] focus:border-[#00311e] focus:ring-1 focus:ring-[#00311e]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#978A56] transition-colors hover:text-[#00311e]"
                >
                  {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!signup && (
                <Link
                  href="/forgot-password"
                  className="self-end text-[12.5px] font-medium text-[#4D694E] transition-colors hover:text-[#00311e]"
                >
                  Olvidé mi contraseña
                </Link>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#00311e] text-[14px] font-medium text-[#fef7e5] shadow-sm transition-all hover:bg-[#002617] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" aria-label="Cargando" /> : copy.emailCta}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-[#00311e]/10" />
            <span className="text-[12px] font-medium uppercase tracking-widest text-[#978A56]">o</span>
            <div className="h-px flex-1 bg-[#00311e]/10" />
          </div>

          <a
            href={buildAuthUrl({ connection: 'google', signup })}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#00311e] text-[14px] font-medium text-[#fef7e5] shadow-sm transition-all hover:bg-[#002617] active:scale-[0.985]"
          >
            <GoogleIcon />
            Continuar con Google
          </a>

          <p className="mt-8 text-[11.5px] leading-relaxed text-[#978A56]">
            Al continuar aceptás la{' '}
            <Link href="/privacy" className="text-[#4D694E] underline underline-offset-2 transition-colors hover:text-[#00311e]">
              Política de Privacidad
            </Link>{' '}
            y los{' '}
            <Link href="/terms" className="text-[#4D694E] underline underline-offset-2 transition-colors hover:text-[#00311e]">
              Términos de Servicio
            </Link>
            .
          </p>
        </div>

        <footer className="mt-auto pt-8 text-center">
          <p className="text-[13px] text-[#4D694E]">
            {copy.footerText}{' '}
            <Link
              href={copy.footerHref}
              className="font-semibold text-[#00311e] underline underline-offset-4 transition-colors hover:text-[#4D694E]"
            >
              {copy.footerLink}
            </Link>
          </p>
        </footer>
      </section>

      <BrandShowcasePanel />
    </div>
  );
}
