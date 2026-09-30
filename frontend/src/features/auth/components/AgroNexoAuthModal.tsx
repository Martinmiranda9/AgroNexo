'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { CircleNotch, EnvelopeSimple, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react';
import BrandMark from '@/ui/components/BrandMark';
import GoogleButton from '@/ui/components/GoogleButton';
import { AUTH_CONTINUE_PATH } from '@/core/auth/config';
import { firebaseErrorMessage, isUserCancelled, signInWithEmail, signInWithGoogle } from '@/core/auth/firebase-actions';
import BrandShowcasePanel from './BrandShowcasePanel';

// ─────────────────────────────────────────────────────────────────────────────
// AGRONEXO BRAND SYSTEM — PINE & BEIGE PALETTE (60-30-10)
// 60% Canvas & Surfaces: Beige (#fef7e5) & Card Ivory (#FFFBF0)
// 30% Structure & High Contrast Text: Pine (#00311e) → máximo contraste sobre Beige
// 10% Accents & Details: Olive (#4D694E) & Sage (#728141)
// ─────────────────────────────────────────────────────────────────────────────

const COPY = {
  title: 'Bienvenido a AgroNexo',
  subtitle: 'Iniciá sesión para gestionar tus establecimientos y asesoramientos.',
  emailCta: 'Iniciar sesión',
  footerText: '¿Todavía no tenés una cuenta?',
  footerLink: 'Crear cuenta',
  footerHref: '/onboarding',
} as const;

const ERROR_MESSAGES: Record<string, string> = {
  auth_not_configured: 'El acceso todavía no está configurado en este entorno.',
};

/**
 * Inicio de sesión (el registro vive en /onboarding). Google y correo+contraseña van directo contra
 * Firebase con el SDK de cliente: sin redirección a una pantalla ajena, el formulario es el nuestro.
 */
export default function AgroNexoAuthModal({ error }: { error?: string }) {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [googleLoading, setGoogleLoading] = useState(false);
  const copy = COPY;
  const errorMessage = formError ?? (error ? (ERROR_MESSAGES[error] ?? 'Ocurrió un error al ingresar. Probá de nuevo.') : undefined);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setFormError(undefined);
    try {
      await signInWithGoogle();
      window.location.assign(AUTH_CONTINUE_PATH);
    } catch (err) {
      if (!isUserCancelled(err)) setFormError(firebaseErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(undefined);
    try {
      await signInWithEmail(email, password);
      window.location.assign(AUTH_CONTINUE_PATH);
    } catch (err) {
      setFormError(firebaseErrorMessage(err));
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
            <h1 className="text-heading-lg tracking-heading text-[#00311e]">
              {copy.title}
            </h1>
            <p className="mt-2 text-body-sm text-[#4D694E]">{copy.subtitle}</p>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-[#8C4A34]/30 bg-[#8C4A34]/5 px-3.5 py-3 text-body-sm text-[#8C4A34]"
            >
              <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={emailId} className="text-body-sm font-medium text-[#00311e]">
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
                  className="h-12 w-full rounded-xl border border-[#00311e]/15 bg-[#fef7e5] pl-10 pr-4 text-body-sm text-[#00311e] outline-none transition-colors placeholder:text-[#978A56] focus:border-[#00311e] focus:ring-1 focus:ring-[#00311e]/10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={passwordId} className="text-body-sm font-medium text-[#00311e]">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#00311e]/15 bg-[#fef7e5] pl-4 pr-11 text-body-sm text-[#00311e] outline-none transition-colors placeholder:text-[#978A56] focus:border-[#00311e] focus:ring-1 focus:ring-[#00311e]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#978A56] transition-colors hover:text-[#00311e]"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Link
                href="/forgot-password"
                className="self-end text-caption font-medium text-[#4D694E] transition-colors hover:text-[#00311e]"
              >
                Olvidé mi contraseña
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#00311e] text-body-sm font-medium text-[#fef7e5] shadow-sm transition-all hover:bg-[#002617] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" aria-label="Cargando" /> : copy.emailCta}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-[#00311e]/10" />
            <span className="text-caption font-medium uppercase tracking-widest text-primary">o</span>
            <div className="h-px flex-1 bg-[#00311e]/10" />
          </div>

          <GoogleButton loading={googleLoading} onClick={handleGoogle} />

          <p className="mt-8 text-caption text-primary">
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
          <p className="text-body-sm text-[#4D694E]">
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
