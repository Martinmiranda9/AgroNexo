'use client';

import { useId, useRef } from 'react';
import { MdOutlineVerified } from 'react-icons/md';
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
      <Badge variant="success">
        <MdOutlineVerified data-icon="inline-start" size={14} aria-hidden />
        Primero, profesionales con matrícula verificada
      </Badge>

      <h1 id="search-hero-title" className="text-display text-pine mt-6 max-w-[14ch] text-balance">
        Encontremos al profesional que{' '}
        {/* Lo que importa resalta en un verde campo oscuro y con más peso, como un llamado a la acción. */}
        <span className="text-field-800 font-extrabold">tu campo necesita.</span>
      </h1>
      <p className="text-body-lg text-sage-800 mt-6 max-w-[46ch]">
        Contalo como se lo dirías a un vecino. Te mostramos quién encaja y por qué.
      </p>

      <div className="mt-8 w-full max-w-[660px] text-left">
        <PromptBox value={value} onChange={onChange} onSubmit={onSubmit} textareaRef={promptRef} />
      </div>

      <div className="mt-8 flex max-w-[660px] flex-col items-center gap-3">
        <span id={examplesLabelId} className="text-body-sm text-sage-600">
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
              className="bg-card/70 rounded-full"
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
