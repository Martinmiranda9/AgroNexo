import type { Workspace } from '@/core/models/farm.model';
import { Badge } from '@/ui/components/Badge';

interface DashboardGreetingProps {
  /** "Buenos días", "Buenas tardes" o "Buenas noches", según la hora de Argentina. */
  greeting: string;
  firstName: string;
  workspace: Workspace;
  archived: boolean;
}

/** Saludo del tablero, como el de la referencia: el nombre de quien mira y, debajo, de qué campo se trata. */
export default function DashboardGreeting({
  greeting,
  firstName,
  workspace,
  archived,
}: DashboardGreetingProps) {
  return (
    <header>
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
    </header>
  );
}
