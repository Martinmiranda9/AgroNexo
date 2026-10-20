import type { Workspace } from '@/core/models/farm.model';
import { StatStrip, StatStripItem } from '@/ui/components/StatStrip';
import { numberLabel } from '../lib/dashboard-view';

/**
 * Resumen de los campos en una tira de métricas (la fila de cifras de la referencia de tabla): cuántos hay en uso, la
 * superficie, cuántos profesionales trabajan en ellos y cuántos campos ya tienen equipo.
 */
export default function FarmsStats({ workspaces }: { workspaces: Workspace[] }) {
  const active = workspaces.filter((workspace) => workspace.archivedAt === null);
  const archived = workspaces.length - active.length;
  const hectares = active.reduce((sum, workspace) => sum + workspace.totalHectares, 0);
  const professionals = new Set(
    active.flatMap((workspace) => workspace.members.map((member) => member.professionalId))
  ).size;
  const withTeam = active.filter((workspace) => workspace.members.length > 0).length;

  return (
    <StatStrip aria-label="Resumen de los campos">
      <StatStripItem
        label="Campos en uso"
        value={active.length}
        info="Los campos sin archivar. Los archivados se ven en la lista pero no suman."
        description={archived > 0 ? `${archived} archivados` : 'ninguno archivado'}
      />
      <StatStripItem
        label="Superficie"
        value={numberLabel(hectares)}
        unit="ha"
        info="Suma de las hectáreas de los campos en uso."
        description="entre todos los campos"
      />
      <StatStripItem
        label="Profesionales"
        value={professionals}
        info="Profesionales distintos que trabajan en al menos uno de los campos."
        description="en los equipos"
      />
      <StatStripItem
        label="Con equipo"
        value={withTeam}
        info="Campos en uso que ya tienen al menos un profesional."
        description={`de ${active.length} campos`}
      />
    </StatStrip>
  );
}
