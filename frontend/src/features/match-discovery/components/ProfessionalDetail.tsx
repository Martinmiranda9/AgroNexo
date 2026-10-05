import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  SealCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react/dist/ssr';
import Avatar from '@/ui/components/Avatar';
import Badge from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { ROLE_REQUIRES_PRESENCE, roleLabel } from '../config/catalog';
import type { SearchableRole } from '@/core/models/identity.model';
import { fullName, hasCapacity, initialsOf, type ResultView } from '../lib/build-results';
import FitBadge from './FitBadge';

interface ProfessionalDetailProps {
  result: ResultView;
  /** Ya se envió una solicitud a este profesional. */
  requested: boolean;
  onRequest: () => void;
}

function zoneLabel(result: ResultView): string {
  const { role, distanceKm } = result.recommendation;
  if (!ROLE_REQUIRES_PRESENCE[role as SearchableRole]) return 'Atiende a distancia';
  return distanceKm < 1
    ? 'Cubre la zona de tu campo'
    : `A ${Math.round(distanceKm)} km de tu campo`;
}

/** Ficha del profesional seleccionado: quién es, por qué aparece, qué falta validar y el botón para pedir el match. */
export default function ProfessionalDetail({
  result,
  requested,
  onRequest,
}: ProfessionalDetailProps) {
  const { recommendation: r } = result;
  const freeSlots = Math.max(r.maxCapacity - r.activeMatches, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start gap-4">
        <Avatar initials={initialsOf(r)} size="lg" tone="solid" />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm text-olive font-medium">{roleLabel(r.role)}</p>
          <h2 className="text-heading-lg tracking-heading text-pine">{fullName(r)}</h2>
        </div>
        <div className="hidden sm:block">
          <FitBadge fit={result.fit} />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <FitBadge fit={result.fit} />
      </div>

      <dl className="border-border text-body-sm text-dark flex flex-wrap gap-x-6 gap-y-2 border-y py-4">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Zona</dt>
          <MapPinIcon size={16} className="text-olive" aria-hidden />
          <dd>{zoneLabel(result)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Experiencia</dt>
          <BriefcaseIcon size={16} className="text-olive" aria-hidden />
          <dd>
            <span className="font-mono">{r.yearsExperience}</span> años de experiencia
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Cupo</dt>
          <UsersThreeIcon size={16} className="text-olive" aria-hidden />
          <dd>
            {hasCapacity(r) ? (
              <>
                <span className="font-mono">{freeSlots}</span> de{' '}
                <span className="font-mono">{r.maxCapacity}</span> cupos libres
              </>
            ) : (
              'Sin cupo por ahora'
            )}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        {r.isVerified ? (
          <Badge variant="positive" icon={<SealCheckIcon size={14} aria-hidden />}>
            Matrícula verificada
          </Badge>
        ) : (
          <Badge variant="alert" icon={<ClockIcon size={14} aria-hidden />}>
            Matrícula sin verificar
          </Badge>
        )}
        <Badge variant="neutral">{r.specialty}</Badge>
      </div>

      <section aria-labelledby={`why-${r.id}`} className="flex flex-col gap-4">
        <h3 id={`why-${r.id}`} className="text-body text-pine font-semibold">
          Por qué aparece
        </h3>
        <p className="text-body-lg text-dark max-w-[58ch]">{result.why}</p>

        <ul className="flex flex-col gap-2.5">
          {result.checks.map((check) => (
            <li key={check} className="text-body-sm text-pine flex items-start gap-2.5">
              <span className="bg-olive/12 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                <CheckIcon size={12} weight="bold" aria-hidden />
              </span>
              {check}
            </li>
          ))}
        </ul>

        {result.missing.length > 0 && (
          <p className="bg-neutral-warm/10 text-body-sm text-dark rounded-lg px-4 py-3">
            <span className="text-pine font-semibold">Falta validar: </span>
            {result.missing.join('; ')}.
          </p>
        )}
      </section>

      {requested ? (
        <p
          role="status"
          className="border-pine/30 text-body-sm text-pine flex items-start gap-2.5 rounded-lg border border-dashed px-4 py-3"
        >
          <CheckCircleIcon size={20} className="text-olive mt-px shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">Solicitud enviada.</span> Cuando {r.firstName} la
            acepte, el match queda activo y se abre el espacio de trabajo compartido.
          </span>
        </p>
      ) : (
        <div>
          <Button type="button" size="lg" onClick={onRequest}>
            Solicitar match
            <ArrowRightIcon data-icon="inline-end" size={16} weight="bold" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
