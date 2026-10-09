import { InfoIcon, MagnifyingGlassIcon, WarningCircleIcon } from '@phosphor-icons/react/dist/ssr';
import { ROUTES } from '@/shared/constants/routes';
import { Alert, AlertDescription, AlertTitle } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import Card from '@/ui/components/Card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui/components/Empty';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/ui/components/Popover';
import type { SearchError } from '../hooks/useMatchDiscovery';
import type { ResultView } from '../lib/build-results';
import ProfessionalDetail, { detailTitleId } from './ProfessionalDetail';
import ResultItem from './ResultItem';
import ResultsSkeleton from './ResultsSkeleton';

/** `id` de la ficha de escritorio: las filas la controlan (`aria-controls`). */
const DETAIL_ID = 'professional-detail';

interface ResultsSectionProps {
  results: ResultView[];
  selected: ResultView | null;
  /** `professionalId` de quienes ya recibieron una solicitud. */
  sentTo: ReadonlySet<string>;
  refreshing: boolean;
  error: SearchError | null;
  isSample: boolean;
  /** Dónde se buscó, para el estado vacío: "tu campo" o el lugar nombrado. */
  zoneLabel: string;
  /** Ya se está mostrando a todas las profesiones (no hay filtro que quitar). */
  allRoles: boolean;
  onSelect: (recommendationId: string) => void;
  onRequest: (result: ResultView) => void;
  onEdit: () => void;
  onRetry: () => void;
  onShowAllRoles: () => void;
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
  zoneLabel,
  allRoles,
  onSelect,
  onRequest,
  onEdit,
  onRetry,
  onShowAllRoles,
}: ResultsSectionProps) {
  return (
    <section aria-labelledby="results-title" className="mt-8 flex flex-col gap-4">
      <h2 id="results-title" className="sr-only">
        Resultados
      </h2>

      {isSample && (
        <Alert role="note">
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
          <div className="flex items-center gap-1.5">
            <p aria-live="polite" className="text-body-sm text-olive">
              <span className="text-pine font-mono font-semibold">{results.length}</span>{' '}
              {results.length === 1 ? 'profesional' : 'profesionales'} · primero los que mejor
              encajan
            </p>
            {/* Popover y no tooltip: se abre tocando, también en el celular. */}
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                    aria-label="Cómo ordenamos los resultados"
                  />
                }
              >
                <InfoIcon size={16} aria-hidden />
              </PopoverTrigger>
              <PopoverContent align="start" className="bg-surface w-80 p-4">
                <PopoverTitle className="text-body-sm text-pine font-semibold">
                  Cómo ordenamos
                </PopoverTitle>
                <p className="text-body-sm text-dark">
                  Arriba van quienes trabajan en lo que pediste, cubren tu zona y tienen lugar.
                  Después pesan, en este orden: cercanía, matrícula verificada, especialidad,
                  experiencia y cupo.
                </p>
              </PopoverContent>
            </Popover>
          </div>

          {refreshing ? (
            <ResultsSkeleton />
          ) : results.length === 0 ? (
            <Empty className="rounded-card border-border-strong bg-surface/70 border py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-secondary text-pine size-10 rounded-full">
                  <MagnifyingGlassIcon size={20} aria-hidden />
                </EmptyMedia>
                <EmptyTitle className="text-body text-pine font-semibold">
                  Todavía no hay profesionales para esto cerca de {zoneLabel}
                </EmptyTitle>
                <EmptyDescription className="text-body-sm text-dark">
                  Probá con otra profesión, quitá algún tema o contalo de otra forma.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row flex-wrap justify-center">
                {!allRoles && (
                  <Button type="button" size="lg" onClick={onShowAllRoles}>
                    Ver todas las profesiones
                  </Button>
                )}
                <Button type="button" variant="outline" size="lg" onClick={onEdit}>
                  Editar búsqueda
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
              <ol className="flex min-w-0 flex-col gap-3">
                {results.map((result, index) => (
                  <li key={result.recommendation.id}>
                    <ResultItem
                      result={result}
                      position={index + 1}
                      selected={selected?.recommendation.id === result.recommendation.id}
                      requested={sentTo.has(result.recommendation.professionalId)}
                      detailId={DETAIL_ID}
                      onSelect={() => onSelect(result.recommendation.id)}
                    />
                  </li>
                ))}
              </ol>

              <div className="hidden min-w-0 lg:block">
                {selected && (
                  <section
                    id={DETAIL_ID}
                    aria-labelledby={detailTitleId(selected.recommendation.id)}
                    aria-live="polite"
                    className="sticky top-24"
                  >
                    <Card surface="paper">
                      <ProfessionalDetail
                        key={selected.recommendation.id}
                        result={selected}
                        requested={sentTo.has(selected.recommendation.professionalId)}
                        onRequest={() => onRequest(selected)}
                      />
                    </Card>
                  </section>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
