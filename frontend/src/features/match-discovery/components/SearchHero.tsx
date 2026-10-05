import { SealCheckIcon } from '@phosphor-icons/react/dist/ssr';
import Badge from '@/ui/components/Badge';
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
  return (
    <section
      aria-labelledby="search-hero-title"
      className="flex flex-col items-center pt-12 text-center sm:pt-20"
    >
      <Badge variant="positive" dot>
        Búsqueda asistida
      </Badge>

      <h1 id="search-hero-title" className="text-display text-pine mt-6 max-w-[14ch] text-balance">
        Encontremos al profesional que tu campo necesita.
      </h1>
      <p className="text-body-lg text-dark mt-6 max-w-[46ch]">
        Contalo como se lo dirías a un vecino. Te mostramos quién encaja y por qué.
      </p>

      <div className="mt-10 w-full max-w-[760px] text-left">
        <PromptBox value={value} onChange={onChange} onSubmit={onSubmit} />
      </div>

      <div
        className="mt-6 flex max-w-[760px] flex-wrap justify-center gap-2"
        role="group"
        aria-label="Ejemplos de búsqueda"
      >
        {EXAMPLE_NEEDS.map((example) => (
          <Button
            key={example.short}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-pill bg-surface/70 backdrop-blur-sm"
            onClick={() => onSubmit(example.full)}
          >
            {example.short}
          </Button>
        ))}
      </div>

      <p className="text-body-sm text-olive mt-8 flex items-center gap-1.5">
        <SealCheckIcon size={16} aria-hidden />
        Los profesionales con matrícula verificada aparecen primero.
      </p>
    </section>
  );
}
