import { InfoIcon, WarningCircleIcon } from '@phosphor-icons/react/dist/ssr';
import { ROUTES } from '@/shared/constants/routes';
import { Alert, AlertDescription, AlertTitle } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import Card from '@/ui/components/Card';
import type { SearchError } from '../hooks/useMatchDiscovery';
import type { ResultView } from '../lib/build-results';
import ProfessionalDetail from './ProfessionalDetail';
import ResultItem from './ResultItem';
import ResultsSkeleton from './ResultsSkeleton';

interface ResultsSectionProps {
  results: ResultView[];
  selected: ResultView | null;
  /** `professionalId` de quienes ya recibieron una solicitud. */
  sentTo: ReadonlySet<string>;
  refreshing: boolean;
  error: SearchError | null;
  isSample: boolean;
  onSelect: (recommendationId: string) => void;
  onRequest: (result: ResultView) => void;
  onEdit: () => void;
  onRetry: () => void;
}

const ERROR_COPY: Record<SearchError, { title: string; description: string }> = {
  unavailable: {
    title: 'No pudimos buscar profesionales',
    description: 'El servicio no respondió. Revisá tu conexión y probá de nuevo.',
  },
  forbidden: {
    title: 'Tu cuenta no puede buscar profesionales',
    description: 'La búsqueda es para cuentas de productor.',
  },
  unauthorized: {
    title: 'Tu sesión venció',
    description: 'Volvé a ingresar para seguir buscando.',
  },
};

/** Lista de profesionales a la izquierda y ficha del seleccionado a la derecha (en celular, la ficha se abre aparte). */
export default function ResultsSection({
  results,
  selected,
  sentTo,
  refreshing,
  error,
  isSample,
  onSelect,
  onRequest,
  onEdit,
  onRetry,
}: ResultsSectionProps) {
  return (
    <section aria-labelledby="results-title" className="mt-8 flex flex-col gap-4">
      <h2 id="results-title" className="sr-only">
        Resultados
      </h2>

      {isSample && (
        <Alert>
          <InfoIcon aria-hidden />
          <AlertTitle>Profesionales de ejemplo</AlertTitle>
          <AlertDescription>
            Estás viendo datos ficticios porque el backend todavía no devolvió profesionales. Solo
            aparece en desarrollo.
          </AlertDescription>
        </Alert>
      )}

      {error ? (
        <Alert variant="destructive" role="alert">
          <WarningCircleIcon aria-hidden />
          <AlertTitle>{ERROR_COPY[error].title}</AlertTitle>
          <AlertDescription>{ERROR_COPY[error].description}</AlertDescription>
          <div className="col-start-2 mt-3">
            {error === 'unauthorized' ? (
              <Button render={<a href={ROUTES.login} />} nativeButton={false} variant="outline">
                Ingresar de nuevo
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={onRetry}>
                Reintentar
              </Button>
            )}
          </div>
        </Alert>
      ) : (
        <>
          <p aria-live="polite" className="text-body-sm text-olive">
            <span className="text-pine font-mono font-semibold">{results.length}</span>{' '}
            {results.length === 1 ? 'profesional' : 'profesionales'}, ordenados por afinidad
          </p>

          {refreshing ? (
            <ResultsSkeleton />
          ) : results.length === 0 ? (
            <div className="rounded-card border-pine/25 bg-surface/70 border border-dashed px-6 py-14 text-center">
              <p className="text-body text-pine font-semibold">
                No encontramos profesionales para esto en tu zona
              </p>
              <p className="text-body-sm text-dark mt-1">
                Probá con otra profesión, quitá algún tema o contalo de otra forma.
              </p>
              <Button type="button" variant="outline" size="lg" className="mt-5" onClick={onEdit}>
                Editar búsqueda
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
              <ol className="flex min-w-0 flex-col gap-3">
                {results.map((result, index) => (
                  <li key={result.recommendation.id}>
                    <ResultItem
                      result={result}
                      position={index + 1}
                      selected={selected?.recommendation.id === result.recommendation.id}
                      requested={sentTo.has(result.recommendation.professionalId)}
                      onSelect={() => onSelect(result.recommendation.id)}
                    />
                  </li>
                ))}
              </ol>

              <div className="hidden min-w-0 lg:block">
                {selected && (
                  <div className="sticky top-24">
                    <Card surface="paper" coreClassName="p-6 sm:p-8">
                      <ProfessionalDetail
                        key={selected.recommendation.id}
                        result={selected}
                        requested={sentTo.has(selected.recommendation.professionalId)}
                        onRequest={() => onRequest(selected)}
                      />
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
