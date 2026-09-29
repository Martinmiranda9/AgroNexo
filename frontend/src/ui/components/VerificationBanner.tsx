'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/shared/utils/cn';
import { checkEmailVerified, resendVerificationEmail } from '@/core/services/verify-email.service';
import { resolveVerificationBannerVisibility } from './verification-banner.logic';
import Button from './Button';

export interface VerificationBannerProps {
  /** `sub` de Auth0 partido por `|` (`google-oauth2` o `auth0`). Sin sesión, no pasar nada. */
  provider?: string;
  className?: string;
}

type Phase = 'loading' | 'idle' | 'resending' | 'checking';

/**
 * Banner de verificación de correo (verde = verificado, rojo = no verificado). Consulta
 * `GET /api/auth/verify-email` al montar y no muestra nada mientras resuelve, si el usuario entró con
 * Google (siempre verificado), o si la verificación no está disponible (Management API de Auth0 sin
 * configurar, sin sesión, error de red) — ver `verification-banner.logic.ts`.
 */
export default function VerificationBanner({ provider, className }: VerificationBannerProps) {
  const skip = provider === 'google-oauth2';
  const [emailVerified, setEmailVerified] = useState<boolean | undefined>();
  const [phase, setPhase] = useState<Phase>(skip ? 'idle' : 'loading');
  const [feedback, setFeedback] = useState<string | undefined>();

  useEffect(() => {
    if (skip) return;
    let cancelled = false;

    checkEmailVerified().then((result) => {
      if (cancelled) return;
      setEmailVerified(result.ok ? result.data.emailVerified : undefined);
      setPhase('idle');
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibility = resolveVerificationBannerVisibility({ provider, emailVerified });

  if (phase === 'loading' || visibility === 'hidden') return null;

  const busy = phase === 'resending' || phase === 'checking';
  const isVerified = visibility === 'verified';

  const handleResend = async () => {
    setPhase('resending');
    setFeedback(undefined);
    const result = await resendVerificationEmail();
    if (result.ok) {
      setEmailVerified(result.data.emailVerified);
      setFeedback(
        result.data.emailVerified
          ? 'Tu correo ya estaba verificado.'
          : 'Te reenviamos el mail. Revisá tu bandeja de entrada.',
      );
    } else {
      setFeedback('No pudimos reenviar el mail. Probá de nuevo en unos minutos.');
    }
    setPhase('idle');
  };

  const handleCheckAgain = async () => {
    setPhase('checking');
    setFeedback(undefined);
    const result = await checkEmailVerified();
    if (result.ok) {
      setEmailVerified(result.data.emailVerified);
      if (!result.data.emailVerified) setFeedback('Todavía no lo verificamos. Puede tardar unos minutos.');
    } else {
      setFeedback('No pudimos consultar el estado. Probá de nuevo.');
    }
    setPhase('idle');
  };

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-3 rounded-card border px-4 py-3 text-body-sm sm:flex-row sm:items-center sm:justify-between',
        isVerified ? 'border-primary/30 bg-primary/10 text-pine' : 'border-danger/30 bg-danger/10 text-pine',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {isVerified ? (
          <CheckCircle size={20} weight="fill" className="text-primary mt-0.5 shrink-0" aria-hidden />
        ) : (
          <WarningCircle size={20} weight="fill" className="text-danger mt-0.5 shrink-0" aria-hidden />
        )}
        <p>
          {isVerified ? 'Tu correo está verificado.' : 'Todavía no verificaste tu correo.'}
          {feedback && <span className="text-caption text-primary mt-0.5 block">{feedback}</span>}
        </p>
      </div>

      {!isVerified && (
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" loading={phase === 'resending'} disabled={busy} onClick={handleResend}>
            Reenviar mail
          </Button>
          <Button type="button" variant="ghost" size="sm" loading={phase === 'checking'} disabled={busy} onClick={handleCheckAgain}>
            Ya verifiqué
          </Button>
        </div>
      )}
    </div>
  );
}
