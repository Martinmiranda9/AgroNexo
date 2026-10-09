import {
  BriefcaseIcon,
  MapPinIcon,
  SealCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/shared/utils/cn';
import { hasCapacity, type ResultView } from '../lib/build-results';

interface ProfessionalMetaProps {
  result: ResultView;
  /** `compact`: una línea chica para la fila de la lista. `full`: la franja de datos de la ficha. */
  variant?: 'compact' | 'full';
  className?: string;
}

/** Los datos que generan confianza a primera vista: matrícula, distancia, experiencia y cupo. */
export default function ProfessionalMeta({
  result,
  variant = 'full',
  className,
}: ProfessionalMetaProps) {
  const { recommendation: r } = result;
  const compact = variant === 'compact';
  const iconSize = compact ? 14 : 16;
  const freeSlots = Math.max(r.maxCapacity - r.activeMatches, 0);

  const items = [
    compact && r.isVerified
      ? {
          key: 'license',
          label: 'Matrícula',
          icon: <SealCheckIcon size={iconSize} className="text-olive" aria-hidden />,
          value: 'Matrícula verificada',
        }
      : null,
    {
      key: 'zone',
      label: 'Zona',
      icon: <MapPinIcon size={iconSize} className="text-olive" aria-hidden />,
      value: compact ? result.proximityShort : result.proximity,
    },
    {
      key: 'experience',
      label: 'Experiencia',
      icon: <BriefcaseIcon size={iconSize} className="text-olive" aria-hidden />,
      value: (
        <>
          <span className="font-mono">{r.yearsExperience}</span>
          {compact ? ' años' : ' años de experiencia'}
        </>
      ),
    },
    {
      key: 'capacity',
      label: 'Cupo',
      icon: <UsersThreeIcon size={iconSize} className="text-olive" aria-hidden />,
      value: hasCapacity(r) ? (
        compact ? (
          'Toma clientes'
        ) : (
          <>
            <span className="font-mono">{freeSlots}</span> de{' '}
            <span className="font-mono">{r.maxCapacity}</span> lugares libres
          </>
        )
      ) : (
        'Sin lugar por ahora'
      ),
    },
  ].filter((item) => item !== null);

  return (
    <dl
      className={cn(
        'flex flex-wrap',
        compact
          ? 'text-caption text-dark gap-x-4 gap-y-1'
          : 'border-border text-body-sm text-dark gap-x-6 gap-y-2 border-y py-4',
        className
      )}
    >
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <dt className="sr-only">{item.label}</dt>
          {item.icon}
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
