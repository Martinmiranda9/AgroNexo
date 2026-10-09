'use client';

import type { ReactNode } from 'react';
import { ClockIcon, MapPinIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react';
import type { SearchableRole } from '@/core/models/identity.model';
import type { SearchLocation } from '@/core/models/match.model';
import { cn } from '@/shared/utils/cn';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { ToggleGroup, ToggleGroupItem } from '@/ui/components/ToggleGroup';
import { NEED_TOPICS, ROLE_FILTER_LABEL, SEARCHABLE_ROLES } from '../config/catalog';
import type { NeedInterpretation } from '../lib/interpret-need';

const ALL = 'all';

/** Chips de lo interpretado: más grandes que el tag estándar para que se lean junto al titular. */
const CHIP = 'text-body-sm h-8 px-2.5 has-data-[icon=inline-start]:pl-2 [&>svg]:size-3.5!';

type Detail = 'activity' | 'hectares' | 'urgency';

interface NeedSummaryProps {
  need: NeedInterpretation;
  /** Dónde se busca: el lugar de registro del productor o el que nombró en el pedido. */
  location: SearchLocation;
  /** El lugar vino de lo que escribió y no de su registro. */
  fromPrompt: boolean;
  /** Lugar que nombró y no se pudo ubicar: se buscó cerca de su campo. */
  unresolvedPlace: string | null;
  onEdit: () => void;
  onRoleChange: (role: SearchableRole | null) => void;
  onRemoveTopic: (topicId: string) => void;
  onClearDetail: (field: Detail) => void;
}

/** Chip con ✕ para quitar lo que se entendió mal. El ✕ mide 28 px pero su área táctil llega a 44 px. */
function RemovableChip({
  label,
  onRemove,
  icon,
  mono = false,
}: {
  label: string;
  onRemove: () => void;
  icon?: ReactNode;
  mono?: boolean;
}) {
  return (
    <Badge variant="secondary" className={cn(CHIP, 'gap-1 pr-1')}>
      {icon}
      <span className={cn(mono && 'font-mono')}>{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="relative rounded-full after:absolute after:-inset-2 after:content-['']"
        aria-label={`Quitar ${label}`}
        onClick={onRemove}
      >
        <XIcon size={12} weight="bold" aria-hidden />
      </Button>
    </Badge>
  );
}

/** Lo que se entendió del pedido, para que el productor lo corrija sin volver a escribir. */
export default function NeedSummary({
  need,
  location,
  fromPrompt,
  unresolvedPlace,
  onEdit,
  onRoleChange,
  onRemoveTopic,
  onClearDetail,
}: NeedSummaryProps) {
  const topics = NEED_TOPICS.filter((topic) => need.topics.includes(topic.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-[72ch] min-w-0">
          <p className="text-body-sm text-olive font-semibold">Buscaste</p>
          <p className="text-body-lg tracking-heading text-pine mt-1 line-clamp-2 font-medium">
            “{need.text}”
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onEdit}>
          <PencilSimpleIcon data-icon="inline-start" size={16} aria-hidden />
          Editar búsqueda
        </Button>
      </div>

      {/* La profesión va primero: es lo que más cambia los resultados. */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ToggleGroup
          aria-label="Profesión"
          variant="segmented"
          spacing={2}
          value={[need.role ?? ALL]}
          onValueChange={(next) => {
            // Volver a tocar la profesión activa la desmarcaría: se ignora, siempre hay una elegida.
            const value = next[0];
            if (value) onRoleChange(value === ALL ? null : (value as SearchableRole));
          }}
          className="w-max"
        >
          <ToggleGroupItem value={ALL}>Todos</ToggleGroupItem>
          {SEARCHABLE_ROLES.map((role) => (
            <ToggleGroupItem key={role} value={role}>
              {ROLE_FILTER_LABEL[role]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-body-sm text-olive mr-1 font-semibold">Entendimos</span>

        <Badge variant="secondary" className={CHIP}>
          <MapPinIcon data-icon="inline-start" size={14} aria-hidden />
          {location.label} · {fromPrompt ? 'zona buscada' : 'tu campo'}
        </Badge>

        {topics.map((topic) => (
          <RemovableChip
            key={topic.id}
            label={topic.label}
            onRemove={() => onRemoveTopic(topic.id)}
          />
        ))}

        {need.activity && (
          <RemovableChip label={need.activity} onRemove={() => onClearDetail('activity')} />
        )}
        {need.hectares !== null && (
          <RemovableChip
            label={`${need.hectares.toLocaleString('es-AR')} ha`}
            mono
            onRemove={() => onClearDetail('hectares')}
          />
        )}
        {need.urgency && (
          <RemovableChip
            label={need.urgency}
            icon={<ClockIcon data-icon="inline-start" size={14} aria-hidden />}
            onRemove={() => onClearDetail('urgency')}
          />
        )}
      </div>

      {unresolvedPlace && (
        <p className="text-body-sm text-olive" role="status">
          No encontramos “{unresolvedPlace}” en el mapa. Buscamos cerca de tu campo.
        </p>
      )}
    </div>
  );
}
