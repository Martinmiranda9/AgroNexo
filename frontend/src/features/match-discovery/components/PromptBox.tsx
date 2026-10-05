'use client';

import { useId, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRightIcon, MicrophoneIcon, StopIcon } from '@phosphor-icons/react';
import { Button } from '@/ui/components/Button';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/ui/components/InputGroup';
import { Label } from '@/ui/components/Label';
import { useDictation } from '../hooks/useDictation';

const MIN_LENGTH = 4;

interface PromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
}

/** Campo único donde el productor cuenta lo que necesita, con dictado por voz y envío con Ctrl/⌘ + Enter. */
export default function PromptBox({ value, onChange, onSubmit }: PromptBoxProps) {
  const id = useId();
  const dictation = useDictation((spoken) => onChange(value ? `${value} ${spoken}` : spoken));
  const ready = value.trim().length >= MIN_LENGTH;

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

  return (
    <form
      onSubmit={submit}
      className="bg-surface/55 shadow-raised ring-pine/8 w-full rounded-[28px] p-1.5 ring-1 backdrop-blur-md"
    >
      {/* El InputGroup oficial atenúa todo el grupo si hay algo deshabilitado adentro (el botón mientras no hay texto): acá no. */}
      <InputGroup className="bg-surface has-disabled:bg-surface rounded-[22px] has-disabled:opacity-100">
        <InputGroupAddon align="block-start" className="px-5 pt-4">
          <Label htmlFor={id} className="text-body-sm text-pine font-semibold">
            Describilo con tus palabras
          </Label>
        </InputGroupAddon>

        <InputGroupTextarea
          id={id}
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={submitWithKeyboard}
          placeholder="Ej.: necesito un contador que sepa de retenciones de granos. Tengo 350 ha de soja."
          className="text-body-lg min-h-24 px-5"
        />

        <InputGroupAddon
          align="block-end"
          className="border-border justify-between gap-3 border-t px-3 pb-3"
        >
          {dictation.supported ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="bg-surface"
              aria-pressed={dictation.listening}
              aria-label={dictation.listening ? 'Dejar de dictar' : 'Dictar'}
              onClick={dictation.toggle}
            >
              {dictation.listening ? (
                <StopIcon data-icon="inline-start" size={18} weight="fill" aria-hidden />
              ) : (
                <MicrophoneIcon data-icon="inline-start" size={18} aria-hidden />
              )}
              <span className="hidden sm:inline">
                {dictation.listening ? 'Escuchando…' : 'Dictar'}
              </span>
            </Button>
          ) : (
            <span />
          )}

          <Button type="submit" size="lg" className="min-w-0 flex-1 sm:flex-none" disabled={!ready}>
            <span className="sm:hidden">Buscar</span>
            <span className="hidden sm:inline">Buscar profesionales</span>
            <ArrowRightIcon data-icon="inline-end" size={16} weight="bold" aria-hidden />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
