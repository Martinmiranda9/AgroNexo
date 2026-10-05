'use client';

import { useEffect, useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/shared/utils/cn';
import { firebaseAuth } from '@/core/auth/firebase-client';
import { resolveVerificationBannerVisibility } from './verification-banner.logic';
import { Button } from './Button';
import { Spinner } from './Spinner';

export interface VerificationBannerProps {
  /** `sign_in_provider` del token de Firebase (`google.com` o `password`). Sin sesión, no pasar nada. */
  provider?: string;
  className?: string;
}

type Phase = 'loading' | 'idle' | 'resending' | 'checking';

/**
 * Banner de verificación de correo (verde = verificado, rojo = no verificado). A diferencia de Auth0,
 * Firebase expone `emailVerified` directo en el usuario del cliente — no hace falta una Management API
 * ni una app M2M: alcanza con `currentUser.reload()` para refrescar el estado.
 */
export default function VerificationBanner({ provider, className }: VerificationBannerProps) {
  const skip = provider === 'google.com';
  const [emailVerified, setEmailVerified] = useState<boolean | undefined>();
  const [phase, setPhase] = useState<Phase>(skip ? 'idle' : 'loading');
  const [feedback, setFeedback] = useState<string | undefined>();

  useEffect(() => {
    if (skip) return;
    return firebaseAuth.onAuthStateChanged((user) => {
      setEmailVerified(user?.emailVerified);
      setPhase('idle');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibility = resolveVerificationBannerVisibility({ provider, emailVerified });

  if (phase === 'loading' || visibility === 'hidden') return null;

  const busy = phase === 'resending' || phase === 'checking';
  const isVerified = visibility === 'verified';

  const handleResend = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    setPhase('resending');
    setFeedback(undefined);
    try {
      await sendEmailVerification(user);
      setFeedback('Te reenviamos el mail. Revisá tu bandeja de entrada.');
    } catch {
      setFeedback('No pudimos reenviar el mail. Probá de nuevo en unos minutos.');
    }
    setPhase('idle');
  };

  const handleCheckAgain = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    setPhase('checking');
    setFeedback(undefined);
    try {
      await user.reload();
      setEmailVerified(user.emailVerified);
      if (!user.emailVerified) setFeedback('Todavía no lo verificamos. Puede tardar unos minutos.');
    } catch {
      setFeedback('No pudimos consultar el estado. Probá de nuevo.');
    }
    setPhase('idle');
  };

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-3 rounded-card border px-4 py-3 text-body-sm sm:flex-row sm:items-center sm:justify-between',
        isVerified ? 'border-olive/30 bg-olive/10 text-pine' : 'border-danger/30 bg-danger/10 text-pine',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {isVerified ? (
          <CheckCircle size={20} weight="fill" className="text-olive mt-0.5 shrink-0" aria-hidden />
        ) : (
          <WarningCircle size={20} weight="fill" className="text-danger mt-0.5 shrink-0" aria-hidden />
        )}
        <p>
          {isVerified ? 'Tu correo está verificado.' : 'Todavía no verificaste tu correo.'}
          {feedback && <span className="text-caption text-olive mt-0.5 block">{feedback}</span>}
        </p>
      </div>

      {!isVerified && (
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={handleResend}>
            {phase === 'resending' && <Spinner data-icon="inline-start" />}
            Reenviar mail
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={handleCheckAgain}>
            {phase === 'checking' && <Spinner data-icon="inline-start" />}
            Ya verifiqué
          </Button>
        </div>
      )}
    </div>
  );
}
