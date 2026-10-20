'use client';

import { useId } from 'react';
import {
  MdCheck,
  MdOutlineBadge,
  MdOutlinePersonAddAlt,
  MdOutlineWorkOutline,
} from 'react-icons/md';
import type { FarmCandidate } from '@/core/models/farm.model';
import { professionalRoleLabel } from '@/shared/constants/roles';
import { InitialsAvatar } from '@/ui/components/Avatar';
import { Badge, BadgeDot } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { Item, ItemActions, ItemContent, ItemMedia } from '@/ui/components/Item';
import { fullName, initialsOf } from '../lib/farm-view';

interface CandidateItemProps {
  candidate: FarmCandidate;
  /** Ya quedó en el equipo en esta apertura del panel. */
  added: boolean;
  adding: boolean;
  /** Otro profesional se está sumando: se bloquean los demás botones. */
  disabled: boolean;
  onInvite: () => void;
}

/**
 * Un profesional con match aceptado: profesión, nombre, especialidad, matrícula y experiencia para reconocerlo de un
 * vistazo, y el botón para sumarlo. Una vez sumado, el botón cambia por la etiqueta "En el equipo".
 */
export default function CandidateItem({
  candidate: c,
  added,
  adding,
  disabled,
  onInvite,
}: CandidateItemProps) {
  const titleId = useId();

  return (
    <Item
      render={<article aria-labelledby={titleId} />}
      variant="outline"
      className="flex-nowrap items-start"
    >
      <ItemMedia>
        <InitialsAvatar initials={initialsOf(c)} size="md" tone="tint" />
      </ItemMedia>

      <ItemContent className="min-w-0 gap-0">
        <p className="text-caption text-muted-foreground font-medium">
          {professionalRoleLabel(c.role)}
        </p>
        <h3 id={titleId} className="text-body tracking-heading text-foreground font-semibold">
          {fullName(c)}
        </h3>
        {c.specialty && <p className="text-body-sm text-sage-800 mt-0.5">{c.specialty}</p>}

        <dl className="text-caption text-sage-800 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {c.licenseNumber && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Matrícula</dt>
              <MdOutlineBadge size={14} className="text-muted-foreground" aria-hidden />
              <dd className="font-mono">{c.licenseNumber}</dd>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Experiencia</dt>
            <MdOutlineWorkOutline size={14} className="text-muted-foreground" aria-hidden />
            <dd>
              <span className="font-mono">{c.yearsExperience}</span> años
            </dd>
          </div>
          {c.isVerified && (
            <div>
              <dt className="sr-only">Verificación</dt>
              <dd>
                <Badge variant="success">
                  <BadgeDot />
                  Matrícula verificada
                </Badge>
              </dd>
            </div>
          )}
        </dl>
      </ItemContent>

      <ItemActions className="self-center">
        {added ? (
          <Badge variant="success">
            <MdCheck data-icon="inline-start" aria-hidden />
            En el equipo
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onInvite}
            disabled={disabled}
            loading={adding}
            loadingText="Sumando…"
            aria-describedby={titleId}
          >
            <MdOutlinePersonAddAlt data-icon="inline-start" size={16} aria-hidden />
            Invitar
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}
