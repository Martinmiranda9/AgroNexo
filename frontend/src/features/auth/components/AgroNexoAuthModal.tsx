'use client';

import { useId, useState } from 'react';
import { useController, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { MdErrorOutline } from 'react-icons/md';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { Field, FieldError, FieldLabel } from '@/ui/components/Field';
import { PasswordInput } from '@/ui/components/PasswordInput';
import { Separator } from '@/ui/components/Separator';
import { Spinner } from '@/ui/components/Spinner';
import BrandMark from '@/ui/components/BrandMark';
import EmailField from '@/ui/components/EmailField';
import GoogleButton from '@/ui/components/GoogleButton';
import { AUTH_CONTINUE_PATH } from '@/core/auth/config';
import {
  firebaseErrorMessage,
  isUserCancelled,
  signInWithEmail,
  signInWithGoogle,
} from '@/core/auth/firebase-actions';
import BrandShowcasePanel from './BrandShowcasePanel';

// Login con Cashmere (paleta v4 e Inter): columna del formulario en blanco y panel de marca en pine.

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
 * El correo controlado vive en su propio componente: cada tecla re-renderiza solo este campo y no toda la pantalla
 * (con el panel de marca incluido), que es lo que pasaba con `useController` en la raíz del formulario.
 */
function LoginEmailField({ control, error }: { control: Control<LoginValues>; error?: string }) {
  const { field } = useController({ name: 'email', control });
  return (
    <EmailField name={field.name} value={field.value} onChange={field.onChange} error={error} />
  );
}

/**
 * Inicio de sesión (el registro vive en /onboarding). Google y correo+contraseña van directo contra
 * Firebase con el SDK de cliente: sin redirección a una pantalla ajena, el formulario es el nuestro.
 */
export default function AgroNexoAuthModal({ error }: { error?: string }) {
  const passwordId = useId();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '' } });
  const [formError, setFormError] = useState<string>();
  const [googleLoading, setGoogleLoading] = useState(false);
  const copy = COPY;
  const errorMessage =
    formError ??
    (error
      ? (ERROR_MESSAGES[error] ?? 'Ocurrió un error al ingresar. Probá de nuevo.')
      : undefined);

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
    <div className="bg-card text-foreground flex min-h-[100dvh] w-full flex-col md:flex-row">
      <section className="flex min-h-[100dvh] w-full flex-col px-8 pt-10 pb-8 sm:px-12 md:w-[46%] md:px-14 lg:px-20">
        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center text-center">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              href="/"
              className="mb-6 block h-14 w-14 rounded-xl shadow-2xs"
              aria-label="AgroNexo — Inicio"
            >
              <BrandMark variant="light" tile className="h-full w-full" />
            </Link>
            <h1 className="text-heading-lg tracking-heading">{copy.title}</h1>
            <p className="text-body-sm text-muted-foreground mt-2">{copy.subtitle}</p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4 text-left">
              <MdErrorOutline aria-hidden />
              <AlertDescription className="text-destructive">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4 text-left"
          >
            <LoginEmailField control={control} error={errors.email?.message} />

            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor={passwordId}>Contraseña</FieldLabel>
              <PasswordInput
                id={passwordId}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <FieldError>{errors.password?.message}</FieldError>
              <Button
                asChild
                variant="link"
                size="sm"
                className="text-muted-foreground self-end px-0"
              >
                <Link href="/forgot-password">Olvidé mi contraseña</Link>
              </Button>
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {copy.emailCta}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <Separator className="flex-1" />
            <span className="text-body-sm text-muted-foreground">o</span>
            <Separator className="flex-1" />
          </div>

          <GoogleButton loading={googleLoading} onClick={handleGoogle} />

          <p className="text-body-sm text-muted-foreground mt-8">
            Al continuar aceptás la{' '}
            <Link
              href="/privacy"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Política de Privacidad
            </Link>{' '}
            y los{' '}
            <Link
              href="/terms"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Términos de Servicio
            </Link>
            .
          </p>
        </div>

        <footer className="mt-auto pt-8 text-center">
          <p className="text-body-sm text-muted-foreground">
            {copy.footerText}{' '}
            <Button asChild variant="link" size="sm" className="px-1 font-semibold">
              <Link href={copy.footerHref}>{copy.footerLink}</Link>
            </Button>
          </p>
        </footer>
      </section>

      <BrandShowcasePanel />
    </div>
  );
}
