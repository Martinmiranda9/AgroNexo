import { useId } from 'react';
import { cn } from '@/shared/utils/cn';
import { Badge, BadgeDot } from '@/ui/components/Badge';
import { Item, ItemContent, ItemDescription } from '@/ui/components/Item';
import { roleLabel } from '../config/catalog';
import { fullName, type ResultView } from '../lib/build-results';
import FitBadge from './FitBadge';
import ProfessionalMeta from './ProfessionalMeta';

interface ResultItemProps {
  result: ResultView;
  /** Posición en la lista (1, 2, 3…). */
  position: number;
  selected: boolean;
  requested: boolean;
  /** `id` de la ficha que muestra el seleccionado (en escritorio). */
  detailId: string;
  onSelect: () => void;
}

/**
 * Fila de la lista: profesión, nombre, si encaja, el porqué y los datos de confianza (matrícula, zona, experiencia,
 * cupo) para comparar sin abrir cada ficha. Es un `<article>` con su título; el botón del nombre se estira sobre
 * toda la fila (patrón "stretched link") para que el heading no quede aplanado dentro de un botón.
 */
export default function ResultItem({
  result,
  position,
  selected,
  requested,
  detailId,
  onSelect,
}: ResultItemProps) {
  const { recommendation: r } = result;
  const titleId = useId();

  return (
    <Item
      render={<article aria-labelledby={titleId} />}
      interactive
      selected={selected}
      className="has-[button:focus-visible]:ring-ring/40 relative flex-nowrap items-start p-4 has-[button:focus-visible]:ring-2"
    >
      {/* El `<ol>` ya anuncia la posición: el número es solo visual. */}
      <span aria-hidden className="text-body-sm text-sage-600 pt-0.5 font-mono font-medium">
        {String(position).padStart(2, '0')}
      </span>

      <ItemContent className="min-w-0 gap-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-body-sm text-sage-600">{roleLabel(r.role)}</p>
            <h3 id={titleId} className="text-body tracking-heading text-pine mt-0.5 font-semibold">
              <button
                type="button"
                onClick={onSelect}
                aria-pressed={selected}
                aria-controls={detailId}
                className="text-left outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']"
              >
                {fullName(r)}
              </button>
            </h3>
          </div>
          <FitBadge fit={result.fit} />
        </div>

        <ItemDescription className="text-body-sm text-sage-800 mt-2">{result.why}</ItemDescription>

        <ProfessionalMeta result={result} variant="compact" className="mt-3" />

        {requested && (
          <Badge variant="warning" className="mt-3">
            <BadgeDot />
            Solicitud enviada
          </Badge>
        )}
      </ItemContent>
    </Item>
  );
}
