'use client';

import { useId, useState } from 'react';
import { EnvelopeSimple, WarningCircle } from '@phosphor-icons/react';
import { Button, Input } from '@/ui/components';
import GoogleButton from '@/ui/components/GoogleButton';
import PasswordField from './PasswordField';
import { firebaseErrorMessage, isUserCancelled, signInWithGoogle, signUpWithEmail } from '@/core/auth/firebase-actions';
import { passwordStrengthError } from '@/core/auth/password-rules';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Paso "Tu cuenta": Google (popup nativo de Firebase) o correo + contraseña + repetir, creados
 * directo con el SDK de cliente de Firebase — sin redirección a una pantalla ajena. Al terminar, la
 * página se recarga con la sesión activa y el wizard sigue con nombre, apellido y correo ya cargados.
 */
export default function AccountStep() {
  const emailId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const reload = () => window.location.assign(`${window.location.pathname}${window.location.search}`);

  const handleGoogle = async () => {
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
    const errors: typeof fieldErrors = {};
    if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Ingresá un correo válido.';
    const passwordError = passwordStrengthError(password);
    if (passwordError) errors.password = passwordError;
    if (password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      <GoogleButton loading={googleLoading} onClick={handleGoogle} />

      {error && (
        <p
          role="alert"
          className="border-danger/30 bg-danger/5 text-danger flex items-start gap-2 rounded-xl border px-3.5 py-3 text-body-sm"
        >
          <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="bg-pine/10 h-px flex-1" />
        <span className="text-caption text-primary font-medium tracking-widest uppercase">o</span>
        <div className="bg-pine/10 h-px flex-1" />
      </div>

      {/* No es un <form>: ya está dentro del <form> del wizard (RegistrationWizard.tsx) y los formularios
          anidados son HTML inválido — el submit del botón terminaba disparando el del wizard, no este. */}
      <div className="flex flex-col gap-4">
        <Input
          id={emailId}
          label="Correo"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          className="h-12"
          leftIcon={<EnvelopeSimple size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <PasswordField
          field={{ kind: 'password', name: 'password', label: 'Contraseña', autoComplete: 'new-password' }}
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
        <Button type="button" variant="outline" size="lg" fullWidth loading={emailLoading} onClick={handleEmail}>
          Crear cuenta
        </Button>
      </div>
    </div>
  );
}
