'use client';

import { useState } from 'react';
import { ArrowRightIcon, WarningCircleIcon } from '@phosphor-icons/react';
import type { CreateMatchResult } from '@/core/models/match.model';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/Dialog';
import { Spinner } from '@/ui/components/Spinner';
import { fullName, type ResultView } from '../lib/build-results';

type Failure = Exclude<CreateMatchResult['status'], 'created' | 'conflict'>;

const FAILURE_COPY: Record<Failure, string> = {
  'not-found': 'Este profesional ya no está disponible.',
  unauthorized: 'Tu sesión venció. Volvé a ingresar para enviar la solicitud.',
  forbidden: 'Tu cuenta no puede enviar solicitudes de match.',
  unavailable: 'No pudimos enviar la solicitud. Probá de nuevo en unos minutos.',
};

interface MatchRequestDialogProps {
  /** Profesional al que se le pide el match; `null` cierra el diálogo. */
  result: ResultView | null;
  onClose: () => void;
  /** Envía la solicitud. Un `conflict` (ya hay una pendiente o activa) se trata como enviada. */
  onConfirm: (result: ResultView) => Promise<CreateMatchResult>;
  onSent: (professionalId: string) => void;
}

function RequestForm({
  result,
  onClose,
  onConfirm,
  onSent,
}: Omit<MatchRequestDialogProps, 'result'> & { result: ResultView }) {
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const { recommendation: r } = result;

  const send = async () => {
    setPending(true);
    setFailure(null);
    const outcome = await onConfirm(result);
    setPending(false);

    if (outcome.status === 'created' || outcome.status === 'conflict') {
      onSent(r.professionalId);
      onClose();
      return;
    }
    setFailure(outcome.status);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-heading-sm tracking-heading text-pine">
          Solicitar match con {fullName(r)}
        </DialogTitle>
        <DialogDescription className="text-body-sm text-dark">
          Le enviamos tu solicitud. Si la acepta, el match queda activo y se abre el espacio de
          trabajo compartido para trabajar juntos.
        </DialogDescription>
      </DialogHeader>

      {failure && (
        <Alert variant="destructive" role="alert">
          <WarningCircleIcon aria-hidden />
          <AlertDescription>{FAILURE_COPY[failure]}</AlertDescription>
        </Alert>
      )}

      <DialogFooter className="bg-transparent">
        <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button type="button" size="lg" onClick={send} disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Enviar solicitud
          {!pending && (
            <ArrowRightIcon data-icon="inline-end" size={16} weight="bold" aria-hidden />
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

/** Confirmación antes de enviar la solicitud de match. El backend crea el match en estado Pendiente. */
export default function MatchRequestDialog({
  result,
  onClose,
  onConfirm,
  onSent,
}: MatchRequestDialogProps) {
  return (
    <Dialog open={result !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface sm:max-w-md">
        {result && (
          <RequestForm result={result} onClose={onClose} onConfirm={onConfirm} onSent={onSent} />
        )}
      </DialogContent>
    </Dialog>
  );
}
