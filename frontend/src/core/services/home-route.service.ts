import type { Workspace } from '@/core/models/farm.model';
import { ROUTES, farmRoute } from '@/shared/constants/routes';

/**
 * A dónde entra un usuario ya registrado: si tiene un campo en uso, a su tablero (con varios, el primero por nombre,
 * el mismo orden de la lista de Campos); si no, el productor a Buscar y el profesional a su Panel (Buscar es solo del
 * productor). Si los campos no se pudieron traer (`null`), va a la entrada de su rol.
 */
export function homeRouteFor(
  role: 'Producer' | 'Professional' | string | undefined,
  workspaces: Workspace[] | null
): string {
  const farm = (workspaces ?? [])
    .filter((workspace) => workspace.archivedAt === null)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))[0];

  if (farm) return farmRoute(farm.farmId);
  return role === 'Producer' ? ROUTES.matchDiscovery : ROUTES.dashboard;
}
