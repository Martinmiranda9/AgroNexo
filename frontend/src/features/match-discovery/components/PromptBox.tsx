'use client';

import { useEffect, useId, useRef, type Ref } from 'react';
import { MdErrorOutline, MdOutlineMic, MdStop } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { AiAgentInput, AiAgentInputIconButton } from '@/ui/components/AiAgentInput';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Badge, BadgeDot } from '@/ui/components/Badge';
import { Label } from '@/ui/components/Label';
import { useDictation, type DictationError } from '../hooks/useDictation';

const MIN_LENGTH = 4;

const HINT = 'Sumá qué hacés, cuántas hectáreas y para cuándo.';
const HINT_TOO_SHORT = `Escribí al menos ${MIN_LENGTH} caracteres para buscar.`;
const HINT_LISTENING = 'Hablá ahora. Tocá el micrófono para terminar.';

const DICTATION_ERROR: Record<DictationError, string> = {
  denied: 'No tenemos permiso para usar el micrófono. Habilitalo en el navegador y probá de nuevo.',
  'no-microphone': 'No encontramos un micrófono para dictar.',
  failed: 'No pudimos usar el dictado. Probá de nuevo o escribilo.',
};

interface PromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
  /** Para que quien lo contiene pueda darle el foco (por ejemplo, al elegir un ejemplo). */
  textareaRef?: Ref<HTMLTextAreaElement>;
}

/**
 * Campo único donde el productor cuenta lo que necesita (AI Agent Input de Cashmere): solo el micrófono para dictar a
 * la izquierda y la flecha para enviar (también con Enter).
 */
export default function PromptBox({ value, onChange, onSubmit, textareaRef }: PromptBoxProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  // Con el dictado continuo pueden llegar dos frases antes de que React vuelva a pintar: se parte del último valor escrito.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const dictation = useDictation((spoken) => {
    const next = latest.current ? `${latest.current} ${spoken}` : spoken;
    latest.current = next;
    onChange(next);
  });
  const ready = value.trim().length >= MIN_LENGTH;
  const tooShort = value.trim().length > 0 && !ready;

  // La ayuda queda siempre a la vista: es la guía de qué contar, no un mensaje de error.
  let hint = HINT;
  if (dictation.listening) {
    hint = dictation.interim ? `“${dictation.interim}”` : HINT_LISTENING;
  } else if (tooShort) {
    hint = HINT_TOO_SHORT;
  }

  return (
    <div>
      {/* La pregunta se ve arriba del campo, en el titular de la pantalla; acá solo la lee el lector de pantalla. */}
      <Label htmlFor={id} className="sr-only">
        ¿Qué necesitás?
      </Label>

      <AiAgentInput
        ref={textareaRef}
        id={id}
        value={value}
        onValueChange={onChange}
        onSubmit={() => ready && onSubmit(value.trim())}
        canSubmit={ready}
        submitLabel="Buscar profesionales"
        aria-describedby={hintId}
        placeholder="Ej.: necesito un contador que sepa de retenciones de granos. Tengo 350 ha de soja."
        leading={
          dictation.supported && (
            <>
              <AiAgentInputIconButton
                aria-label={dictation.listening ? 'Detener el dictado' : 'Dictar'}
                title={dictation.listening ? 'Detener el dictado' : 'Dictar'}
                aria-pressed={dictation.listening}
                onClick={dictation.toggle}
              >
                {dictation.listening ? (
                  <MdStop size={20} aria-hidden />
                ) : (
                  <MdOutlineMic size={20} aria-hidden />
                )}
              </AiAgentInputIconButton>
              {/* La región existe siempre: así el lector de pantalla anuncia cuando aparece "Escuchando". */}
              <span role="status">
                {dictation.listening && (
                  <Badge variant="success">
                    <BadgeDot className="animate-pulse motion-reduce:animate-none" />
                    Escuchando…
                  </Badge>
                )}
              </span>
            </>
          )
        }
      />

      <p
        id={hintId}
        className={cn(
          'text-body-sm text-muted-foreground mt-3 min-h-5 px-3 text-center',
          !dictation.listening && 'line-clamp-2'
        )}
      >
        {hint}
      </p>

      {dictation.error && (
        <Alert variant="destructive" className="mt-2">
          <MdErrorOutline aria-hidden />
          <AlertDescription className="text-destructive">
            {DICTATION_ERROR[dictation.error]}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
