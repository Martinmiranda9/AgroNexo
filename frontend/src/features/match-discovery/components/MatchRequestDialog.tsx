'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRightIcon,
  CaretDownIcon,
  CheckIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { CreateMatchResult, NeedBrief } from '@/core/models/match.model';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/components/Collapsible';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/ui/components/Drawer';
import { Label } from '@/ui/components/Label';
import NeedBriefCard from '@/ui/components/NeedBriefCard';
import { Textarea } from '@/ui/components/Textarea';
import { useNeedBriefDraft } from '../hooks/useNeedBriefDraft';
import { fullName, type ResultView } from '../lib/build-results';
import type { NeedInterpretation } from '../lib/interpret-need';
import {
  SUMMARY_MAX_LENGTH,
  SUMMARY_MIN_LENGTH,
  buildNeedBrief,
  isValidSummary,
} from '../lib/need-brief';
import TrustNote from './TrustNote';

type Failure = Exclude<CreateMatchResult['status'], 'created' | 'conflict'>;

const FAILURE_COPY: Record<Failure, string> = {
  'not-found': 'Este profesional ya no está disponible.',
  invalid: 'El mensaje tiene un problema. Revisalo y probá de nuevo.',
  unauthorized: 'Tu sesión venció. Volvé a ingresar para enviar la solicitud.',
  forbidden: 'Tu cuenta no puede enviar solicitudes de match.',
  unavailable: 'No pudimos enviar la solicitud. Probá de nuevo en unos minutos.',
};

/** `created`: la solicitud salió ahora. `conflict`: ya había una pendiente o activa con esta persona. */
type Sent = 'created' | 'conflict';

/** Las tres franjas del drawer: encabezado fijo, cuerpo con scroll y pie con las acciones siempre a la vista. */
const HEADER = 'relative px-6 pt-6 pb-4 text-left group-data-[swipe-axis=y]/drawer-popup:text-left';
const BODY = 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6';
const FOOTER =
  'border-border bg-surface mt-0 flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end';

/**
 * En escritorio el panel entra desde la derecha como una card flotante (separada del borde, con radio de bisel) y
 * más ancha que el drawer estándar, para que la ficha se lea cómoda.
 */
const RIGHT_PANEL_STYLE = {
  '--drawer-inset': '0.75rem',
  '--drawer-content-width': 'min(34rem, calc(100vw - 1.5rem))',
} as CSSProperties;

interface MatchRequestDialogProps {
  /** Profesional al que se le pide el match; `null` cierra el panel. */
  result: ResultView | null;
  /** Lo que se entendió del pedido: de acá sale la ficha que recibe el profesional. */
  need: NeedInterpretation | null;
  /** Zona de la búsqueda en texto ("Berrotarán, Córdoba"). */
  placeLabel: string;
  /** Nombre del productor, para la vista previa de la ficha. */
  producerName: string;
  /** Cierra el panel; `sent` indica si la solicitud quedó enviada. */
  onClose: (sent: boolean) => void;
  /** Envía la solicitud con la ficha. */
  onConfirm: (result: ResultView, brief: NeedBrief) => Promise<CreateMatchResult>;
  onSent: (professionalId: string) => void;
  /**
   * `right` en escritorio: panel lateral a pantalla completa de alto.
   * `down` en celular: desde abajo, anidado sobre el drawer de la ficha (al cerrarlo, la ficha sigue debajo).
   */
  side?: 'right' | 'down';
}

function CloseButton() {
  return (
    <DrawerClose
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-4 right-4 rounded-full"
          aria-label="Cerrar"
        />
      }
    >
      <XIcon size={16} aria-hidden />
    </DrawerClose>
  );
}

/** Confirmación de envío: check animado, qué pasa ahora y los dos caminos posibles. */
function SentView({
  result,
  sent,
  onClose,
}: {
  result: ResultView;
  sent: Sent;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const { recommendation: r } = result;

  return (
    <>
      <div className={cn(BODY, 'items-center justify-center pt-10 text-center')}>
        <motion.span
          initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="bg-pine text-beige flex size-16 items-center justify-center rounded-full"
        >
          <CheckIcon size={32} weight="bold" aria-hidden />
        </motion.span>

        <DrawerTitle className="text-heading-md tracking-heading text-pine max-w-[22ch] text-balance">
          {sent === 'created'
            ? `Listo, le enviamos tu solicitud a ${fullName(r)}`
            : `Ya le habías enviado una solicitud a ${fullName(r)}`}
        </DrawerTitle>
        <DrawerDescription className="text-body text-dark max-w-[40ch]">
          {sent === 'created'
            ? `Cuando ${r.firstName} responda, lo vas a ver en Mis solicitudes.`
            : `Sigue esperando respuesta. La podés seguir en Mis solicitudes.`}
        </DrawerDescription>
      </div>

      <DrawerFooter className={FOOTER}>
        <Button type="button" variant="outline" size="lg" onClick={onClose}>
          Seguir buscando
        </Button>
        <Button render={<Link href={ROUTES.matches} />} nativeButton={false} size="lg">
          Ver mis solicitudes
          <ArrowRightIcon data-icon="inline-end" size={16} weight="bold" aria-hidden />
        </Button>
      </DrawerFooter>
    </>
  );
}

function RequestForm({
  result,
  need,
  placeLabel,
  producerName,
  onCancel,
  onConfirm,
  onSent,
}: Omit<MatchRequestDialogProps, 'result' | 'onClose' | 'onSent' | 'side'> & {
  result: ResultView;
  onCancel: () => void;
  onSent: (sent: Sent) => void;
}) {
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [touched, setTouched] = useState(false);
  const { summary, composing, edit } = useNeedBriefDraft(need, placeLabel);
  const { recommendation: r } = result;

  const brief = need ? buildNeedBrief(need, placeLabel, summary) : null;
  const canSend = brief !== null && isValidSummary(summary);

  const send = async () => {
    if (!brief || !canSend) return;
    setPending(true);
    setFailure(null);
    const outcome = await onConfirm(result, brief);
    setPending(false);

    if (outcome.status === 'created' || outcome.status === 'conflict') {
      onSent(outcome.status);
      return;
    }
    setFailure(outcome.status);
  };

  let hint = `${summary.trim().length}/${SUMMARY_MAX_LENGTH} caracteres`;
  if (composing) hint = 'Estamos armando el mensaje con lo que contaste…';
  else if (!canSend)
    hint = `Escribí al menos ${SUMMARY_MIN_LENGTH} caracteres para poder enviarla.`;

  return (
    <>
      <DrawerHeader className={HEADER}>
        <DrawerTitle className="text-heading-sm tracking-heading text-pine pr-10">
          Solicitar match con {fullName(r)}
        </DrawerTitle>
        <DrawerDescription className="text-body-sm text-dark">
          Esto es lo que le va a llegar a {r.firstName}. Revisalo antes de enviarlo.
        </DrawerDescription>
        <CloseButton />
      </DrawerHeader>

      <div className={BODY}>
        {brief && (
          <NeedBriefCard
            counterpartName={producerName}
            counterpartCaption="Productor"
            brief={brief}
            statusLabel={composing ? 'Redactando…' : 'Vista previa'}
          />
        )}

        {/* El mensaje ya se ve en la vista previa: el campo para corregirlo se despliega solo si hace falta. */}
        <Collapsible className="flex flex-col gap-3">
          <CollapsibleTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="-mt-1 self-start"
                disabled={pending}
              />
            }
          >
            <PencilSimpleIcon data-icon="inline-start" size={16} aria-hidden />
            Editar mensaje
            <CaretDownIcon
              data-icon="inline-end"
              size={14}
              weight="bold"
              aria-hidden
              className="transition-transform group-data-panel-open/button:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2">
            <Label htmlFor="need-brief-summary">Mensaje para {r.firstName}</Label>
            <Textarea
              id="need-brief-summary"
              value={summary}
              onChange={(event) => {
                setTouched(true);
                edit(event.target.value);
              }}
              maxLength={SUMMARY_MAX_LENGTH}
              rows={5}
              aria-describedby="need-brief-summary-hint"
              aria-invalid={touched && !canSend}
              aria-busy={composing}
              disabled={pending}
            />
            <p id="need-brief-summary-hint" className="text-caption text-olive" aria-live="polite">
              {hint}
            </p>
          </CollapsibleContent>
        </Collapsible>

        <TrustNote firstName={r.firstName} />

        {failure && (
          <Alert variant="destructive" role="alert">
            <WarningCircleIcon aria-hidden />
            <AlertDescription>{FAILURE_COPY[failure]}</AlertDescription>
          </Alert>
        )}
      </div>

      <DrawerFooter className={FOOTER}>
        <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={send}
          disabled={!canSend}
          loading={pending}
          loadingText="Enviando solicitud…"
        >
          Enviar solicitud
          <ArrowRightIcon data-icon="inline-end" size={16} weight="bold" aria-hidden />
        </Button>
      </DrawerFooter>
    </>
  );
}

/**
 * Revisión y envío de la solicitud de match en un Drawer: panel lateral en escritorio, hoja inferior en celular.
 * Ocupa la pantalla a propósito: es la decisión importante del flujo y tiene que sentirse firme, no un aviso al pasar.
 */
export default function MatchRequestDialog({
  result,
  need,
  placeLabel,
  producerName,
  onClose,
  onConfirm,
  onSent,
  side = 'right',
}: MatchRequestDialogProps) {
  const [sent, setSent] = useState<Sent | null>(null);
  // Mientras se anima el cierre `result` ya es null: se sigue mostrando el último para que no quede vacío.
  // Al abrirse con otro profesional se vuelve al formulario.
  const [shown, setShown] = useState(result);
  if (result && result !== shown) {
    setShown(result);
    setSent(null);
  }
  const view = result ?? shown;
  const right = side === 'right';

  const close = () => onClose(sent !== null);

  return (
    <Drawer
      open={result !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      swipeDirection={side}
      showSwipeHandle={!right}
    >
      <DrawerContent
        style={right ? RIGHT_PANEL_STYLE : undefined}
        className={cn(
          'bg-surface',
          right && 'rounded-shell border-pine/10 ring-pine/5 border ring-4'
        )}
      >
        {view &&
          (sent ? (
            <SentView result={view} sent={sent} onClose={close} />
          ) : (
            <RequestForm
              key={view.recommendation.id}
              result={view}
              need={need}
              placeLabel={placeLabel}
              producerName={producerName}
              onCancel={close}
              onConfirm={onConfirm}
              onSent={(outcome) => {
                onSent(view.recommendation.professionalId);
                setSent(outcome);
              }}
            />
          ))}
      </DrawerContent>
    </Drawer>
  );
}
