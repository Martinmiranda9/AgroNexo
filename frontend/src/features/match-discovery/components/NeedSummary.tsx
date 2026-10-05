'use client';

import { ClockIcon, MapPinIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react';
import type { SearchableRole } from '@/core/models/identity.model';
import type { SearchLocation } from '@/core/models/match.model';
import Badge from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { ToggleGroup, ToggleGroupItem } from '@/ui/components/ToggleGroup';
import { NEED_TOPICS, ROLE_FILTER_LABEL, SEARCHABLE_ROLES } from '../config/catalog';
import type { NeedInterpretation } from '../lib/interpret-need';

const ALL = 'all';

interface NeedSummaryProps {
  need: NeedInterpretation;
  location: SearchLocation;
  onEdit: () => void;
  onRoleChange: (role: SearchableRole | null) => void;
  onRemoveTopic: (topicId: string) => void;
}

/** Lo que se entendió del pedido, para que el productor lo corrija sin volver a escribir. */
export default function NeedSummary({
  need,
  location,
  onEdit,
  onRoleChange,
  onRemoveTopic,
}: NeedSummaryProps) {
  const topics = NEED_TOPICS.filter((topic) => need.topics.includes(topic.id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-[72ch] min-w-0">
          <p className="text-body-sm text-olive font-semibold">Buscaste</p>
          <p className="text-heading-sm tracking-heading text-pine sm:text-heading-md mt-1">
            “{need.text}”
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onEdit}>
          <PencilSimpleIcon data-icon="inline-start" size={16} aria-hidden />
          Editar búsqueda
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-body-sm text-olive mr-1 font-semibold">Entendí</span>

        <Badge
          variant="neutral"
          icon={<MapPinIcon size={14} aria-hidden />}
          className="text-body-sm h-8"
        >
          {location.label} · tu campo
        </Badge>

        {topics.map((topic) => (
          <Badge key={topic.id} variant="neutral" className="text-body-sm h-8 gap-1 pr-1">
            {topic.label}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-full"
              aria-label={`Quitar ${topic.label}`}
              onClick={() => onRemoveTopic(topic.id)}
            >
              <XIcon size={12} weight="bold" aria-hidden />
            </Button>
          </Badge>
        ))}

        {need.activity && (
          <Badge variant="neutral" className="text-body-sm h-8">
            {need.activity}
          </Badge>
        )}
        {need.hectares !== null && (
          <Badge variant="neutral" className="text-body-sm h-8 font-mono">
            {need.hectares.toLocaleString('es-AR')} ha
          </Badge>
        )}
        {need.urgency && (
          <Badge
            variant="neutral"
            icon={<ClockIcon size={14} aria-hidden />}
            className="text-body-sm h-8"
          >
            {need.urgency}
          </Badge>
        )}
      </div>

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
    </div>
  );
}
