import type { FarmCandidate, FarmMember, Workspace } from '@/core/models/farm.model';

type Person = Pick<FarmMember | FarmCandidate, 'firstName' | 'lastName'>;

export const fullName = (person: Person): string => `${person.firstName} ${person.lastName}`.trim();

export const initialsOf = (person: Person): string =>
  `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`.toUpperCase() || 'P';

const hectaresFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

/** "350 ha"; sin hectáreas cargadas, `null` (no se muestra un "0 ha" que confunde). */
export function hectaresLabel(hectares: number): string | null {
  return hectares > 0 ? `${hectaresFormat.format(hectares)} ha` : null;
}

/** "Sin equipo todavía", "1 profesional", "3 profesionales". */
export function teamCaption(workspace: Pick<Workspace, 'members'>): string {
  const count = workspace.members.length;
  if (count === 0) return 'Sin equipo todavía';
  return count === 1 ? '1 profesional' : `${count} profesionales`;
}

/** Campos en uso primero (por nombre) y los archivados al final. */
export function sortWorkspaces(workspaces: Workspace[]): Workspace[] {
  return [...workspaces].sort(
    (a, b) =>
      Number(a.archivedAt !== null) - Number(b.archivedAt !== null) ||
      a.name.localeCompare(b.name, 'es')
  );
}
