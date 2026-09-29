'use client';

import { useId, useState } from 'react';
import { EnvelopeSimple, WarningCircle } from '@phosphor-icons/react';
import { Button, Input } from '@/ui/components';
import GoogleButton from '@/ui/components/GoogleButton';
import { startEmailSignIn, startGoogleSignIn } from '@/core/auth/google-sign-in';

const ERRORS: Record<string, string> = {
  access_denied: 'No pudimos completar el acceso. Probá de nuevo.',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Paso "Tu cuenta": Google o correo, ambos en un popup con la pantalla hosteada de Auth0 (ahí se pide o
 * crea la contraseña — Auth0 no permite intercambiar credenciales directo desde nuestro servidor para
 * tenants nuevos). Al terminar, la página se recarga con la sesión activa y el wizard sigue con nombre,
 * apellido y correo ya cargados.
 */
export default function AccountStep() {
  const emailId = useId();
  const [email, setEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();

  const reload = () => window.location.assign(`${window.location.pathname}${window.location.search}`);

  const handleGoogle = () => {
    setGoogleLoading(true);
    setError(undefined);
    startGoogleSignIn({
      onSuccess: reload,
      onError: (code) => {
        setError(ERRORS[code] ?? ERRORS.access_denied);
        setGoogleLoading(false);
      },
      onCancel: () => setGoogleLoading(false),
    });
  };

  const handleEmail = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Ingresá un correo válido.');
      return;
    }
    setEmailError(undefined);
    setEmailLoading(true);
    setError(undefined);
    startEmailSignIn(
      email.trim(),
      {
        onSuccess: reload,
        onError: (code) => {
          setError(ERRORS[code] ?? ERRORS.access_denied);
          setEmailLoading(false);
        },
        onCancel: () => setEmailLoading(false),
      },
      { signup: true },
    );
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleEmail();
            }
          }}
          error={emailError}
        />
        <Button type="button" variant="outline" size="lg" fullWidth loading={emailLoading} onClick={handleEmail}>
          Continuar con correo
        </Button>
      </div>
    </div>
  );
}
