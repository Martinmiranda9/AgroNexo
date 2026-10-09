'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { toast } from '@/ui/components/Toaster';
import { updateMatchStatusAction } from '@/core/actions/update-match-status.action';
import type {
  MatchContact,
  MatchDecision,
  UpdateMatchStatusResult,
} from '@/core/models/match.model';
import { Alert, AlertDescription, AlertTitle } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import ContactCard from '@/ui/components/ContactCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/Dialog';

type Failure = Exclude<UpdateMatchStatusResult['status'], 'ok'>;

const FAILURE_COPY: Record<Failure, string> = {
  invalid: 'Esta solicitud ya no está pendiente.',
  'not-found': 'Esta solicitud ya no existe.',
  unauthorized: 'Tu sesión venció. Volvé a ingresar para responder.',
  forbidden: 'Tu cuenta no puede responder esta solicitud.',
  unavailable: 'No pudimos guardar tu respuesta. Probá de nuevo en unos minutos.',
};

interface MatchRequestActionsProps {
  matchId: string;
  /** Nombre del productor, para la confirmación de rechazo. */
  requesterName: string;
}

/**
 * Aceptar o rechazar una solicitud de match pendiente. Aceptar es el único CTA primario; rechazar es definitivo y
 * pide confirmación. Tras responder se avisa con un toast y se refresca la lista para que la solicitud cambie de estado.
 */
export default function MatchRequestActions({ matchId, requesterName }: MatchRequestActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deciding, setDeciding] = useState<MatchDecision | null>(null);
  const [confirmReject, setConfirmReject] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  // Respuesta ya guardada: se muestra al instante, sin esperar a que la lista vuelva a pedirse.
  const [answered, setAnswered] = useState<MatchDecision | null>(null);
  const [contact, setContact] = useState<MatchContact | null>(null);

  const decide = (decision: MatchDecision) => {
    setFailure(null);
    setDeciding(decision);
    startTransition(async () => {
      const outcome = await updateMatchStatusAction(matchId, decision);
      if (outcome.status === 'ok') {
        setConfirmReject(false);
        setAnswered(decision);
        setContact(outcome.match.producerContact ?? null);
        if (decision === 'Active') {
          toast.success(`Aceptaste la solicitud de ${requesterName}`, {
            description: 'Ya podés ver sus datos de contacto.',
          });
        } else {
          toast(`Rechazaste la solicitud de ${requesterName}`);
        }
        router.refresh();
        return;
      }
      setFailure(outcome.status);
      setDeciding(null);
    });
  };

  if (answered) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant={answered === 'Active' ? 'success' : 'default'} role="status">
          <CheckIcon aria-hidden />
          <AlertTitle>
            {answered === 'Active' ? 'Aceptaste esta solicitud' : 'Rechazaste esta solicitud'}
          </AlertTitle>
          <AlertDescription>
            {answered === 'Active'
              ? `El match con ${requesterName} quedó activo.`
              : `${requesterName} va a ver que no la aceptaste.`}
          </AlertDescription>
        </Alert>
        {answered === 'Active' && contact && (
          <ContactCard
            name={requesterName}
            phoneNumber={contact.phoneNumber}
            email={contact.email}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {failure && !confirmReject && (
        <Alert variant="destructive" role="alert">
          <WarningCircleIcon aria-hidden />
          <AlertDescription>{FAILURE_COPY[failure]}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setConfirmReject(true)}
          disabled={pending}
        >
          Rechazar
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={() => decide('Active')}
          disabled={pending && deciding !== 'Active'}
          loading={deciding === 'Active'}
          loadingText="Aceptando…"
        >
          <CheckIcon data-icon="inline-start" size={16} weight="bold" aria-hidden />
          Aceptar
        </Button>
      </div>

      <Dialog open={confirmReject} onOpenChange={(open) => !pending && setConfirmReject(open)}>
        <DialogContent className="bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-heading-sm tracking-heading text-pine">
              ¿Rechazar la solicitud de {requesterName}?
            </DialogTitle>
            <DialogDescription className="text-body-sm text-dark">
              No vas a poder deshacerlo. El productor va a ver que no aceptaste la solicitud.
            </DialogDescription>
          </DialogHeader>

          {failure && (
            <Alert variant="destructive" role="alert">
              <WarningCircleIcon aria-hidden />
              <AlertDescription>{FAILURE_COPY[failure]}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="bg-transparent">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setConfirmReject(false)}
              disabled={pending}
            >
              Volver
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={() => decide('Rejected')}
              disabled={pending && deciding !== 'Rejected'}
              loading={deciding === 'Rejected'}
              loadingText="Rechazando…"
            >
              Rechazar solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
