'use client';

import { useId, useRef } from 'react';
import { SealCheckIcon } from '@phosphor-icons/react/dist/ssr';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { EXAMPLE_NEEDS } from '../config/catalog';
import PromptBox from './PromptBox';

interface SearchHeroProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
}

/** Entrada de la pantalla: titular, campo para describir lo que se necesita y ejemplos para empezar. */
export default function SearchHero({ value, onChange, onSubmit }: SearchHeroProps) {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const examplesLabelId = useId();

  /** Un ejemplo no busca solo: llena el campo y deja el cursor al final para que el productor lo ajuste y confirme. */
  const fillExample = (text: string) => {
    onChange(text);
    const field = promptRef.current;
    field?.focus();
    requestAnimationFrame(() => field?.setSelectionRange(text.length, text.length));
  };

  return (
    <section
      aria-labelledby="search-hero-title"
      className="flex flex-col items-center pt-10 text-center sm:pt-16"
    >
      {/* Primera señal de confianza: antes que el nombre de la función, lo que le importa al productor. */}
      <Badge variant="success" className="text-body-sm h-7 px-3">
        <SealCheckIcon data-icon="inline-start" size={14} aria-hidden />
        Primero, profesionales con matrícula verificada
      </Badge>

      <h1 id="search-hero-title" className="text-display text-pine mt-6 max-w-[14ch] text-balance">
        Encontremos al profesional que tu campo necesita.
      </h1>
      <p className="text-body-lg text-dark mt-6 max-w-[46ch]">
        Contalo como se lo dirías a un vecino. Te mostramos quién encaja y por qué.
      </p>

      <div className="mt-8 w-full max-w-[660px] text-left">
        <PromptBox value={value} onChange={onChange} onSubmit={onSubmit} textareaRef={promptRef} />
      </div>

      <div className="mt-8 flex max-w-[660px] flex-col items-center gap-3">
        <span id={examplesLabelId} className="text-body-sm text-olive">
          Por ejemplo:
        </span>
        <div
          className="flex flex-wrap justify-center gap-2.5"
          role="group"
          aria-labelledby={examplesLabelId}
        >
          {EXAMPLE_NEEDS.map((example) => (
            <Button
              key={example.short}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-pill bg-surface/70"
              onClick={() => fillExample(example.full)}
            >
              {example.short}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
