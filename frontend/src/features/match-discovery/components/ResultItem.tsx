import { cn } from '@/shared/utils/cn';
import { roleLabel } from '../config/catalog';
import { fullName, type ResultView } from '../lib/build-results';
import FitBadge from './FitBadge';

interface ResultItemProps {
  result: ResultView;
  /** Posición en la lista (1, 2, 3…). */
  position: number;
  selected: boolean;
  requested: boolean;
  onSelect: () => void;
}

/** Fila seleccionable de la lista: profesión, nombre, si encaja y el porqué en una línea. */
export default function ResultItem({
  result,
  position,
  selected,
  requested,
  onSelect,
}: ResultItemProps) {
  const { recommendation: r } = result;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'rounded-card bg-surface focus-visible:border-ring focus-visible:ring-ring/50 w-full border p-4 text-left transition-all outline-none focus-visible:ring-3 sm:p-5',
        selected ? 'border-pine ring-pine/8 ring-3' : 'border-pine/10 hover:border-pine/30'
      )}
    >
      <div className="flex gap-4">
        <span className="text-body-sm text-olive pt-0.5 font-mono font-medium">
          {String(position).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-body-sm text-olive">{roleLabel(r.role)}</p>
              <h3 className="text-body tracking-heading text-pine mt-0.5 font-semibold">
                {fullName(r)}
              </h3>
            </div>
            <FitBadge fit={result.fit} />
          </div>

          <p className="text-body-sm text-dark mt-2 line-clamp-2">{result.why}</p>
          {requested && (
            <p className="text-caption text-pine mt-2 font-semibold">Solicitud enviada</p>
          )}
        </div>
      </div>
    </button>
  );
}
