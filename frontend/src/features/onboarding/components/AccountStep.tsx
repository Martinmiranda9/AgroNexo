'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { MdErrorOutline, MdOutlineMail } from 'react-icons/md';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { Checkbox } from '@/ui/components/Checkbox';
import { Field, FieldContent, FieldError, FieldLabel } from '@/ui/components/Field';
import { Separator } from '@/ui/components/Separator';
import { Spinner } from '@/ui/components/Spinner';
import GoogleButton from '@/ui/components/GoogleButton';
import PasswordField from './PasswordField';
import {
  firebaseErrorMessage,
  isUserCancelled,
  signInWithGoogle,
  signUpWithEmail,
} from '@/core/auth/firebase-actions';
import { PASSWORD_REQUIREMENTS_HINT, passwordStrengthError } from '@/core/auth/password-rules';
import EmailField, { validateEmail } from '@/ui/components/EmailField';
import type { PasswordField as PasswordFieldDef } from '../config/types';

// Fuera del componente: con la misma referencia en cada render, `PasswordField` (memo) no se re-renderiza al tipear
// en el correo o en la otra contraseña.
const PASSWORD_FIELD: PasswordFieldDef = {
  kind: 'password',
  name: 'password',
  label: 'Contraseña',
  autoComplete: 'new-password',
  hint: PASSWORD_REQUIREMENTS_HINT,
};

const CONFIRM_PASSWORD_FIELD: PasswordFieldDef = {
  kind: 'password',
  name: 'confirmPassword',
  label: 'Repetir contraseña',
  confirms: 'password',
  autoComplete: 'new-password',
};

/**
 * Paso "Tu cuenta": Google (popup nativo de Firebase) o correo + contraseña + repetir, creados
 * directo con el SDK de cliente de Firebase — sin redirección a una pantalla ajena. Al terminar, la
 * página se recarga con la sesión activa y el wizard sigue con nombre, apellido y correo ya cargados.
 */
export default function AccountStep() {
  const termsId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const reload = () =>
    window.location.assign(`${window.location.pathname}${window.location.search}`);

  const requireTerms = () => {
    if (acceptedTerms) return true;
    setTermsError(
      'Tenés que aceptar la Política de Privacidad y los Términos de Servicio para continuar.'
    );
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
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
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
          <FieldLabel
            htmlFor={termsId}
            className="text-muted-foreground leading-normal font-normal"
          >
            <span>
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
            </span>
          </FieldLabel>
          <FieldError>{termsError}</FieldError>
        </FieldContent>
      </Field>

      <GoogleButton loading={googleLoading} onClick={handleGoogle} />

      {error && (
        <Alert variant="destructive">
          <MdErrorOutline aria-hidden />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3" aria-hidden="true">
        <Separator className="flex-1" />
        <span className="text-body-sm text-muted-foreground">o</span>
        <Separator className="flex-1" />
      </div>

      {/* No es un <form>: ya está dentro del <form> del wizard (RegistrationWizard.tsx) y los formularios
          anidados son HTML inválido — el submit del botón terminaba disparando el del wizard, no este. */}
      <div className="flex flex-col gap-4">
        <EmailField value={email} onChange={setEmail} error={fieldErrors.email} />
        <PasswordField
          field={PASSWORD_FIELD}
          value={password}
          error={fieldErrors.password}
          onChange={setPassword}
        />
        <PasswordField
          field={CONFIRM_PASSWORD_FIELD}
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={setConfirmPassword}
        />
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={emailLoading}
          onClick={handleEmail}
        >
          {emailLoading && <Spinner data-icon="inline-start" />}
          Crear cuenta
        </Button>
      </div>
    </div>
  );
}
