import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  SealCheckIcon,
} from '@phosphor-icons/react/dist/ssr';
import { Alert, AlertDescription, AlertTitle } from '@/ui/components/Alert';
import Avatar from '@/ui/components/Avatar';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { roleLabel } from '../config/catalog';
import { fullName, hasCapacity, initialsOf, type ResultView } from '../lib/build-results';
import FitBadge from './FitBadge';
import ProfessionalMeta from './ProfessionalMeta';
import ReasonList from './ReasonList';
import TrustNote from './TrustNote';

interface ProfessionalDetailProps {
  result: ResultView;
  /** Ya se envió una solicitud a este profesional. */
  requested: boolean;
  onRequest: () => void;
}

/** `id` del nombre en la ficha: lo usan el panel de escritorio y el drawer de celular como título accesible. */
export const detailTitleId = (recommendationId: string) => `professional-${recommendationId}-name`;

/** Ficha del profesional seleccionado: quién es, por qué aparece, qué consultarle y el botón para solicitar el match. */
export default function ProfessionalDetail({
  result,
  requested,
  onRequest,
}: ProfessionalDetailProps) {
  const { recommendation: r } = result;
  const available = hasCapacity(r);

  // Cuerpo con scroll propio y acción fija abajo: igual en el panel de escritorio y en el drawer de celular.
  return (
    <div className="flex max-h-[calc(100dvh-8rem)] min-h-0 flex-col">
      <div className="flex min-h-0 flex-col gap-6 overflow-y-auto p-5 sm:p-8">
        <header className="flex items-start gap-4">
          <Avatar initials={initialsOf(r)} size="lg" tone="solid" />
          <div className="min-w-0 flex-1">
            <p className="text-body-sm text-olive font-medium">{roleLabel(r.role)}</p>
            <h2 id={detailTitleId(r.id)} className="text-heading-md tracking-heading text-pine">
              {fullName(r)}
            </h2>
          </div>
          <div className="hidden sm:block">
            <FitBadge fit={result.fit} />
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <span className="sm:hidden">
            <FitBadge fit={result.fit} />
          </span>
          {r.isVerified ? (
            <Badge variant="success">
              <SealCheckIcon data-icon="inline-start" size={12} aria-hidden />
              Matrícula verificada
            </Badge>
          ) : (
            <Badge variant="warning">
              <ClockIcon data-icon="inline-start" size={12} aria-hidden />
              Matrícula sin verificar
            </Badge>
          )}
          <Badge variant="secondary">{r.specialty}</Badge>
        </div>

        <ProfessionalMeta result={result} />

        <section aria-labelledby={`why-${r.id}`} className="flex flex-col gap-4">
          <h3 id={`why-${r.id}`} className="text-body text-pine font-semibold">
            Por qué aparece
          </h3>
          <p className="text-body-lg text-dark max-w-[58ch]">{result.why}</p>
          <ReasonList checks={result.checks} missing={result.missing} />
        </section>
      </div>

      <div className="border-border flex shrink-0 flex-col gap-3 border-t px-5 py-4 sm:px-8 sm:py-5">
        {requested ? (
          <Alert
            role="status"
            variant="success"
            className="border-border-strong border-dashed px-4 py-3"
          >
            <CheckCircleIcon aria-hidden />
            <AlertTitle className="text-body-sm text-pine font-semibold">
              Solicitud enviada
            </AlertTitle>
            <AlertDescription className="text-body-sm text-dark">
              Cuando {r.firstName} la acepte, el match queda activo. La seguís en Mis solicitudes.
            </AlertDescription>
          </Alert>
        ) : available ? (
          <>
            <Button type="button" size="lg" className="self-start" onClick={onRequest}>
              Solicitar match
              <ArrowRightIcon data-icon="inline-end" size={16} weight="bold" aria-hidden />
            </Button>
            <TrustNote firstName={r.firstName} />
          </>
        ) : (
          <>
            <Button
              type="button"
              size="lg"
              className="self-start"
              disabled
              focusableWhenDisabled
              aria-describedby={`full-${r.id}`}
            >
              Solicitar match
            </Button>
            <p id={`full-${r.id}`} className="text-body-sm text-olive">
              {r.firstName} no tiene lugar para clientes nuevos por ahora. Probá con otro
              profesional de la lista.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
