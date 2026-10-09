'use client';

import { useEffect, useId, useRef, type FormEvent, type KeyboardEvent, type Ref } from 'react';
import { ArrowRightIcon, MicrophoneIcon, StopIcon } from '@phosphor-icons/react';
import { cn } from '@/shared/utils/cn';
import { Badge, BadgeDot } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/ui/components/InputGroup';
import { Label } from '@/ui/components/Label';
import { Kbd, KbdGroup } from '@/ui/components/Kbd';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
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

/** Campo único donde el productor cuenta lo que necesita, con dictado por voz y envío con Ctrl/⌘ + Enter. */
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
  // El atajo solo tiene sentido con teclado físico: en el celular no se muestra.
  const finePointer = useMediaQuery('(pointer: fine)');
  const ready = value.trim().length >= MIN_LENGTH;
  const tooShort = value.trim().length > 0 && !ready;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (ready) onSubmit(value.trim());
  };

  const submitWithKeyboard = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && ready) {
      event.preventDefault();
      onSubmit(value.trim());
    }
  };

  // La ayuda queda siempre a la vista: es la guía de qué contar, no un mensaje de error.
  let hint = HINT;
  if (dictation.listening) {
    hint = dictation.interim ? `“${dictation.interim}”` : HINT_LISTENING;
  } else if (tooShort) {
    hint = HINT_TOO_SHORT;
  }

  return (
    <div>
      <form
        onSubmit={submit}
        className="bg-surface-sunken shadow-raised ring-pine/8 rounded-shell w-full p-1.5 ring-1"
      >
        <InputGroup className="bg-surface rounded-card">
          {/* La pregunta se ve arriba del campo, en el titular de la pantalla; acá solo la lee el lector de pantalla. */}
          <Label htmlFor={id} className="sr-only">
            ¿Qué necesitás?
          </Label>

          <InputGroupTextarea
            ref={textareaRef}
            id={id}
            rows={2}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={submitWithKeyboard}
            aria-describedby={hintId}
            placeholder="Ej.: necesito un contador que sepa de retenciones de granos. Tengo 350 ha de soja."
            className="text-body-lg min-h-20 px-5 pt-4"
          />

          <InputGroupAddon align="block-end" className="justify-between gap-3 px-3 pb-3">
            <div className="flex min-w-0 items-center gap-2">
              {dictation.supported && (
                // Con texto y no solo ícono: el productor dicta como manda un audio de WhatsApp, es una entrada principal.
                <Button
                  type="button"
                  variant={dictation.listening ? 'default' : 'outline'}
                  aria-pressed={dictation.listening}
                  onClick={dictation.toggle}
                >
                  {dictation.listening ? (
                    <StopIcon data-icon="inline-start" size={18} weight="fill" aria-hidden />
                  ) : (
                    <MicrophoneIcon data-icon="inline-start" size={18} aria-hidden />
                  )}
                  {dictation.listening ? 'Detener' : 'Dictar'}
                </Button>
              )}
              {/* La región existe siempre: así el lector de pantalla anuncia cuando aparece "Escuchando". */}
              <span role="status">
                {dictation.listening && (
                  <Badge variant="success">
                    <BadgeDot className="animate-pulse motion-reduce:animate-none" />
                    Escuchando…
                  </Badge>
                )}
              </span>
            </div>

            {/* Sin `disabled` nativo: así el botón sigue en el orden de tabulación y el lector explica por qué no avanza. */}
            <Button
              type="submit"
              className="min-w-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              disabled={!ready}
              focusableWhenDisabled
              aria-describedby={hintId}
            >
              <span>
                Buscar<span className="max-sm:hidden"> profesionales</span>
              </span>
              <ArrowRightIcon data-icon="inline-end" size={16} weight="bold" aria-hidden />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </form>

      <div className="mt-3 flex min-h-5 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 text-center">
        <p
          id={hintId}
          className={cn('text-body-sm text-olive', !dictation.listening && 'line-clamp-2')}
        >
          {hint}
        </p>
        {finePointer && !dictation.listening && (
          <span className="text-caption text-olive inline-flex items-center gap-1.5" aria-hidden>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>Enter</Kbd>
            </KbdGroup>
            para buscar
          </span>
        )}
      </div>

      {dictation.error && (
        <p role="alert" className="text-body-sm text-danger mt-1 px-3 text-center">
          {DICTATION_ERROR[dictation.error]}
        </p>
      )}
    </div>
  );
}
