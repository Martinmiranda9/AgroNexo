'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { EnvelopeSimple, WarningCircle } from '@phosphor-icons/react';
import {
  Button,
  Checkbox,
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Spinner,
} from '@/ui/components';
import GoogleButton from '@/ui/components/GoogleButton';
import PasswordField from './PasswordField';
import { firebaseErrorMessage, isUserCancelled, signInWithGoogle, signUpWithEmail } from '@/core/auth/firebase-actions';
import { PASSWORD_REQUIREMENTS_HINT, passwordStrengthError } from '@/core/auth/password-rules';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Paso "Tu cuenta": Google (popup nativo de Firebase) o correo + contraseña + repetir, creados
 * directo con el SDK de cliente de Firebase — sin redirección a una pantalla ajena. Al terminar, la
 * página se recarga con la sesión activa y el wizard sigue con nombre, apellido y correo ya cargados.
 */
export default function AccountStep() {
  const emailId = useId();
  const termsId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const reload = () => window.location.assign(`${window.location.pathname}${window.location.search}`);

  const requireTerms = () => {
    if (acceptedTerms) return true;
    setTermsError('Tenés que aceptar la Política de Privacidad y los Términos de Servicio para continuar.');
    return false;
  };

  const handleGoogle = async () => {
    if (!requireTerms()) return;
    setGoogleLoading(true);
    setError(undefined);
    try {
      await signInWithGoogle();
      reload();
    } catch (err) {
      if (!isUserCancelled(err)) setError(firebaseErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  const handleEmail = async () => {
    const termsOk = requireTerms();
    const errors: typeof fieldErrors = {};
    if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Ingresá un correo válido.';
    const passwordError = passwordStrengthError(password);
    if (passwordError) errors.password = passwordError;
    if (password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !termsOk) return;

    setEmailLoading(true);
    setError(undefined);
    try {
      await signUpWithEmail(email.trim(), password);
      reload();
    } catch (err) {
      setError(firebaseErrorMessage(err));
      setEmailLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Field orientation="horizontal" data-invalid={termsError ? true : undefined}>
        <Checkbox
          id={termsId}
          checked={acceptedTerms}
          aria-invalid={!!termsError}
          onCheckedChange={(checked) => {
            setAcceptedTerms(checked);
            if (checked) setTermsError(undefined);
          }}
        />
        <FieldContent>
          <FieldLabel htmlFor={termsId} className="text-body-sm leading-normal font-normal text-olive">
            <span>
              Al continuar aceptás la{' '}
              <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-pine">
                Política de Privacidad
              </Link>{' '}
              y los{' '}
              <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-pine">
                Términos de Servicio
              </Link>
              .
            </span>
          </FieldLabel>
          <FieldError>{termsError}</FieldError>
        </FieldContent>
      </Field>

      <GoogleButton loading={googleLoading} onClick={handleGoogle} />

      {error && (
        <p
          role="alert"
          className="border-danger/30 bg-danger/5 text-danger flex items-start gap-2 rounded-lg border px-3.5 py-3 text-body-sm"
        >
          <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="bg-pine/10 h-px flex-1" />
        <span className="text-caption text-olive font-medium tracking-widest uppercase">o</span>
        <div className="bg-pine/10 h-px flex-1" />
      </div>

      {/* No es un <form>: ya está dentro del <form> del wizard (RegistrationWizard.tsx) y los formularios
          anidados son HTML inválido — el submit del botón terminaba disparando el del wizard, no este. */}
      <div className="flex flex-col gap-4">
        <Field data-invalid={fieldErrors.email ? true : undefined}>
          <FieldLabel htmlFor={emailId}>Correo</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <EnvelopeSimple />
            </InputGroupAddon>
            <InputGroupInput
              id={emailId}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputGroup>
          <FieldError id={`${emailId}-error`}>{fieldErrors.email}</FieldError>
        </Field>
        <PasswordField
          field={{ kind: 'password', name: 'password', label: 'Contraseña', autoComplete: 'new-password', hint: PASSWORD_REQUIREMENTS_HINT }}
          value={password}
          error={fieldErrors.password}
          onChange={setPassword}
        />
        <PasswordField
          field={{ kind: 'password', name: 'confirmPassword', label: 'Repetir contraseña', confirms: 'password', autoComplete: 'new-password' }}
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={setConfirmPassword}
        />
        <Button type="button" size="lg" className="w-full" disabled={emailLoading} onClick={handleEmail}>
          {emailLoading && <Spinner data-icon="inline-start" />}
          Crear cuenta
        </Button>
      </div>
    </div>
  );
}
