'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { EnvelopeSimple, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react';
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Spinner,
} from '@/ui/components';
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

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Ingresá tu correo.').email('Ingresá un correo válido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
});
type LoginValues = z.infer<typeof loginSchema>;

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
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
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

  const onSubmit = async ({ email, password }: LoginValues) => {
    setFormError(undefined);
    try {
      await signInWithEmail(email, password);
      window.location.assign(AUTH_CONTINUE_PATH);
    } catch (err) {
      setFormError(firebaseErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-bg-card text-pine md:flex-row">
      <section className="flex min-h-[100dvh] w-full flex-col px-8 pb-8 pt-10 sm:px-12 md:w-[46%] md:px-14 lg:px-20">
        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center text-center">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              href="/"
              className="mb-6 block h-14 w-14 rounded-xl shadow-2xs"
              aria-label="AgroNexo — Inicio"
            >
              <BrandMark variant="light" tile className="h-full w-full" />
            </Link>
            <h1 className="text-heading-lg tracking-heading text-pine">
              {copy.title}
            </h1>
            <p className="mt-2 text-body-sm text-olive">{copy.subtitle}</p>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-3 text-body-sm text-danger"
            >
              <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="text-left">
            <FieldGroup className="gap-3.5">
              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor={emailId}>Correo</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <EnvelopeSimple />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="tu@correo.com"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                </InputGroup>
                <FieldError>{errors.email?.message}</FieldError>
              </Field>

              <Field data-invalid={errors.password ? true : undefined}>
                <FieldLabel htmlFor={passwordId}>Contraseña</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={passwordId}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    {...register('password')}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      className="text-neutral-warm hover:text-pine"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeSlash /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError>{errors.password?.message}</FieldError>
                <Link
                  href="/forgot-password"
                  className="self-end py-1.5 text-body-sm font-medium text-olive underline-offset-4 transition-colors hover:text-pine hover:underline"
                >
                  Olvidé mi contraseña
                </Link>
              </Field>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {copy.emailCta}
              </Button>
            </FieldGroup>
          </form>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-pine/10" />
            <span className="text-caption font-medium uppercase tracking-widest text-olive">o</span>
            <div className="h-px flex-1 bg-pine/10" />
          </div>

          <GoogleButton loading={googleLoading} onClick={handleGoogle} />

          <p className="mt-8 text-body-sm text-olive">
            Al continuar aceptás la{' '}
            <Link href="/privacy" className="text-olive underline underline-offset-2 transition-colors hover:text-pine">
              Política de Privacidad
            </Link>{' '}
            y los{' '}
            <Link href="/terms" className="text-olive underline underline-offset-2 transition-colors hover:text-pine">
              Términos de Servicio
            </Link>
            .
          </p>
        </div>

        <footer className="mt-auto pt-8 text-center">
          <p className="text-body-sm text-olive">
            {copy.footerText}{' '}
            <Link
              href={copy.footerHref}
              className="font-semibold text-pine underline underline-offset-4 transition-colors hover:text-olive"
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
