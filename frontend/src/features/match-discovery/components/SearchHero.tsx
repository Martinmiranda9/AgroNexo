'use client';

import { useId, useRef } from 'react';
import type { IconType } from 'react-icons';
import {
  MdOutlineCalculate,
  MdOutlineGavel,
  MdOutlineGrass,
  MdOutlineTrendingUp,
} from 'react-icons/md';
import type { SearchableRole } from '@/core/models/identity.model';
import BrandMark from '@/ui/components/BrandMark';
import { Button } from '@/ui/components/Button';
import IconContainer from '@/ui/components/IconContainer';
import { EXAMPLE_NEEDS } from '../config/catalog';
import PromptBox from './PromptBox';

/** Ícono de cada profesión en los tags de ejemplo. */
const ROLE_ICON: Record<SearchableRole, IconType> = {
  Accountant: MdOutlineCalculate,
  Agronomist: MdOutlineGrass,
  Lawyer: MdOutlineGavel,
  Investor: MdOutlineTrendingUp,
};

interface SearchHeroProps {
  /** Nombre del productor para el saludo; vacío, saluda sin nombre. */
  firstName: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
}

/**
 * Entrada de la pantalla, a todo el alto: en el centro el isotipo, el saludo, qué hacer y los tags de ejemplo; abajo,
 * el campo para contar lo que se necesita (como un chat).
 */
export default function SearchHero({ firstName, value, onChange, onSubmit }: SearchHeroProps) {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const examplesLabelId = useId();
  const greeting = firstName ? `Hola, ${firstName}` : 'Hola';

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
      className="flex min-h-[calc(100dvh-5.5rem)] flex-col items-center"
    >
      <div className="flex w-full flex-1 flex-col items-center justify-center py-10 text-center">
        <BrandMark tile width={56} height={56} />

        <h1 id="search-hero-title" className="text-display text-foreground mt-6">
          {greeting}
        </h1>
        <p className="text-body-lg text-muted-foreground mt-3 max-w-[44ch] text-balance">
          Contanos qué necesita tu campo y te mostramos los profesionales que mejor encajan, y por
          qué.
        </p>

        <div className="mt-10 flex max-w-[680px] flex-col items-center gap-3">
          <span id={examplesLabelId} className="sr-only">
            Probá con
          </span>
          <div
            className="flex flex-wrap justify-center gap-3"
            role="group"
            aria-labelledby={examplesLabelId}
          >
            {EXAMPLE_NEEDS.map((example) => {
              const Icon = ROLE_ICON[example.role];
              return (
                <Button
                  key={example.short}
                  type="button"
                  variant="surface"
                  className="pl-1.5"
                  onClick={() => fillExample(example.full)}
                >
                  <IconContainer size="sm" tone="brand">
                    <Icon />
                  </IconContainer>
                  {example.short}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[680px] pb-2 text-left">
        <PromptBox value={value} onChange={onChange} onSubmit={onSubmit} textareaRef={promptRef} />
      </div>
    </section>
  );
}
