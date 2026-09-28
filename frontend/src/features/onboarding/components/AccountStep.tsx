'use client';

import { useState } from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import GoogleButton from '@/ui/components/GoogleButton';
import { startGoogleSignIn } from '@/core/auth/google-sign-in';
import type { AccountCredentials, StepDef } from '../config/types';
import type { FieldErrors } from '../lib/validation';
import StepFields from './StepFields';

const GOOGLE_ERRORS: Record<string, string> = {
  access_denied: 'No pudimos completar el acceso con Google. Probá de nuevo.',
};

interface AccountStepProps {
  step: StepDef;
  credentials: AccountCredentials;
  errors: FieldErrors;
  onChange: (patch: Partial<AccountCredentials>) => void;
}

/**
 * Paso "Tu cuenta": Google (popup) o correo y contraseña con confirmación. Con Google, al terminar la
 * página se recarga con la sesión activa y el wizard arranca ya con nombre, apellido y correo cargados.
 */
export default function AccountStep({ step, credentials, errors, onChange }: AccountStepProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string>();

  const handleGoogle = () => {
    setGoogleLoading(true);
    setGoogleError(undefined);
    startGoogleSignIn({
      // Recarga la misma URL (conserva ?type=): el servidor ahora ve la sesión y prellena los datos.
      onSuccess: () => window.location.assign(`${window.location.pathname}${window.location.search}`),
      onError: (code) => {
        setGoogleError(GOOGLE_ERRORS[code] ?? 'No pudimos completar el acceso con Google. Probá de nuevo.');
        setGoogleLoading(false);
      },
      onCancel: () => setGoogleLoading(false),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <GoogleButton loading={googleLoading} onClick={handleGoogle} />

      {googleError && (
        <p
          role="alert"
          className="border-danger/30 bg-danger/5 text-danger flex items-start gap-2 rounded-xl border px-3.5 py-3 text-body-sm"
        >
          <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
          {googleError}
        </p>
      )}

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="bg-pine/10 h-px flex-1" />
        <span className="text-caption text-primary font-medium tracking-widest uppercase">o</span>
        <div className="bg-pine/10 h-px flex-1" />
      </div>

      <StepFields
        fields={step.fields}
        values={{ ...credentials }}
        errors={errors}
        onChange={(patch) => onChange(patch as Partial<AccountCredentials>)}
      />
    </div>
  );
}
