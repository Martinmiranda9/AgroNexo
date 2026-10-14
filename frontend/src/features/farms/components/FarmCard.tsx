import { MdOutlineAgriculture, MdOutlinePersonAddAlt } from 'react-icons/md';
import type { Workspace } from '@/core/models/farm.model';
import { professionalRoleLabel } from '@/shared/constants/roles';
import Avatar from '@/ui/components/Avatar';
import { AvatarGroup } from '@/ui/components/AvatarShadcn';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import Card from '@/ui/components/Card';
import IconContainer from '@/ui/components/IconContainer';
import { fullName, hectaresLabel, initialsOf, teamCaption } from '../lib/farm-view';

/** Caras visibles del equipo; el resto se resume en el texto de al lado. */
const MAX_FACES = 4;

interface FarmCardProps {
  workspace: Workspace;
  /** Solo el productor dueño, con el campo en uso. */
  onInvite?: () => void;
}

/**
 * Un campo en la lista: nombre e ID, descripción, hectáreas y las caras del equipo. El productor tiene a mano
 * "Invitar profesionales"; el profesional ve de quién es el campo.
 */
export default function FarmCard({ workspace: w, onInvite }: FarmCardProps) {
  const archived = w.archivedAt !== null;
  const hectares = hectaresLabel(w.totalHectares);
  const isOwner = w.viewerRole === 'Owner';
  const faces = w.members.slice(0, MAX_FACES);

  return (
    <Card
      surface="paper"
      muted={archived}
      className="h-full"
      coreClassName="flex h-full flex-col gap-4 p-5"
    >
      <header className="flex items-start gap-3">
        {/* En tinte: con un círculo pine por card, los íconos competían con el botón principal. */}
        <IconContainer>
          <MdOutlineAgriculture size={18} aria-hidden />
        </IconContainer>
        <div className="min-w-0 flex-1">
          <h2 className="text-body tracking-heading text-pine truncate font-semibold">{w.name}</h2>
          <p className="text-caption text-olive font-medium">
            ID <span className="font-mono">{w.publicId}</span>
            {hectares && (
              <>
                {' · '}
                <span className="font-mono">{hectares}</span>
              </>
            )}
            {!isOwner && w.producerName && ` · De ${w.producerName}`}
          </p>
        </div>
        {archived && <Badge variant="secondary">Archivado</Badge>}
      </header>

      {w.description && (
        <p className="text-body-sm text-dark line-clamp-3 whitespace-pre-line">{w.description}</p>
      )}

      <footer className="border-border mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex min-w-0 items-center gap-3">
          {faces.length > 0 && (
            <AvatarGroup aria-hidden>
              {faces.map((member) => (
                <Avatar key={member.id} initials={initialsOf(member)} size="sm" tone="tint" />
              ))}
            </AvatarGroup>
          )}
          <p className="text-body-sm text-dark">
            {teamCaption(w)}
            {/* Para lectores de pantalla, quiénes son (las caras son decorativas). */}
            {w.members.length > 0 && (
              <span className="sr-only">
                :{' '}
                {w.members
                  .map((m) => `${fullName(m)} (${professionalRoleLabel(m.role)})`)
                  .join(', ')}
              </span>
            )}
          </p>
        </div>

        {onInvite && (
          <Button type="button" variant="outline" onClick={onInvite}>
            <MdOutlinePersonAddAlt data-icon="inline-start" size={16} aria-hidden />
            Invitar profesionales
          </Button>
        )}
      </footer>
    </Card>
  );
}
