import type { ReactNode } from 'react';
import { MdCheckCircle, MdOutlineGroups } from 'react-icons/md';
import type { FarmMember } from '@/core/models/farm.model';
import { professionalRoleLabel } from '@/shared/constants/roles';
import { InitialsAvatar } from '@/ui/components/Avatar';
import { Badge, BadgeDot } from '@/ui/components/Badge';
import { Card } from '@/ui/components/Card';
import { fullName, initialsOf } from '../../lib/farm-view';

interface TeamCardProps {
  producerName: string;
  members: FarmMember[];
  /** Para el productor: invitar a más profesionales. */
  action?: ReactNode;
}

/**
 * Quién trabaja en el campo, en tarjetas como las "My Cards" de la referencia: el productor en pine y cada profesional
 * con su profesión y si tiene la matrícula verificada. Sin contactos: entre profesionales no se comparten.
 */
export default function TeamCard({ producerName, members, action }: TeamCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="border-border text-foreground flex size-10 items-center justify-center rounded-xl border">
            <MdOutlineGroups size={20} aria-hidden />
          </span>
          <h2 className="text-body text-foreground font-medium">Equipo</h2>
        </div>
        {action}
      </div>

      <ul className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
        <li className="bg-pine flex min-h-32 w-44 shrink-0 flex-col justify-between rounded-xl p-4 text-white">
          <Badge variant="inverse">Productor</Badge>
          <div>
            <p className="text-caption text-white/70">Dueño del campo</p>
            <p className="text-body-sm truncate font-semibold">{producerName}</p>
          </div>
        </li>
        {members.map((member) => (
          <li
            key={member.id}
            className="bg-surface-sunken flex min-h-32 w-44 shrink-0 flex-col justify-between rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <InitialsAvatar initials={initialsOf(member)} size="sm" tone="tint" />
              {member.isVerified ? (
                <Badge variant="success">
                  <MdCheckCircle data-icon="inline-start" aria-hidden />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="warning">
                  <BadgeDot />
                  Sin verificar
                </Badge>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-caption text-muted-foreground truncate">
                {professionalRoleLabel(member.role)}
                {member.specialty && ` · ${member.specialty}`}
              </p>
              <p className="text-body-sm text-foreground truncate font-semibold">
                {fullName(member)}
              </p>
            </div>
          </li>
        ))}
        {members.length === 0 && (
          <li className="text-caption text-muted-foreground flex w-44 shrink-0 items-center rounded-xl border border-dashed p-4">
            Todavía no hay profesionales en este campo.
          </li>
        )}
      </ul>
    </Card>
  );
}
