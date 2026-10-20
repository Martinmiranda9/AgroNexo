import { MdOutlinePersonAddAlt } from 'react-icons/md';
import type { Workspace } from '@/core/models/farm.model';
import { AvatarGroup, InitialsAvatar } from '@/ui/components/Avatar';
import { Badge } from '@/ui/components/Badge';
import { IconButton } from '@/ui/components/IconButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/Tooltip';
import { fullName, initialsOf } from '../../lib/farm-view';

interface DashboardGreetingProps {
  /** "Buenos días", "Buenas tardes" o "Buenas noches", según la hora de Argentina. */
  greeting: string;
  firstName: string;
  workspace: Workspace;
  archived: boolean;
  /** Para el productor: invitar profesionales (el botón junto a las caras del equipo). */
  onInvite?: () => void;
}

/** Caras que entran antes del "+N". */
const MAX_FACES = 4;

/**
 * Saludo del tablero, como el de la referencia: el nombre de quien mira y, debajo, de qué campo se trata. A la derecha,
 * las caras del equipo y el botón para sumar gente (los avatares con "+3" de la referencia de tabla).
 */
export default function DashboardGreeting({
  greeting,
  firstName,
  workspace,
  archived,
  onInvite,
}: DashboardGreetingProps) {
  const people = [
    {
      id: 'producer',
      initials: initialsFromName(workspace.producerName),
      name: workspace.producerName,
    },
    ...workspace.members.map((member) => ({
      id: member.id,
      initials: initialsOf(member),
      name: fullName(member),
    })),
  ];

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-heading-xl tracking-heading text-foreground font-medium">
          {firstName ? `${greeting}, ${firstName}` : greeting}
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            Seguí los lotes, las labores y la actividad del equipo en{' '}
            <span className="text-foreground font-medium">{workspace.name}</span>.
          </span>
          {archived && <Badge variant="secondary">Archivado</Badge>}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <AvatarGroup
          role="group"
          aria-label={`Equipo del campo: ${people.map((person) => person.name).join(', ')}`}
          max={MAX_FACES}
          total={people.length}
        >
          {people.map((person, index) => (
            <InitialsAvatar
              key={person.id}
              initials={person.initials}
              tone={index === 0 ? 'solid' : 'tint'}
              title={person.name}
              aria-hidden
            />
          ))}
        </AvatarGroup>
        {onInvite && (
          <Tooltip>
            <TooltipTrigger
              render={
                <IconButton
                  variant="surface"
                  size="lg"
                  shape="round"
                  aria-label="Invitar al equipo"
                  onClick={onInvite}
                />
              }
            >
              <MdOutlinePersonAddAlt aria-hidden />
            </TooltipTrigger>
            <TooltipContent>Invitar al equipo</TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || 'P';
}
