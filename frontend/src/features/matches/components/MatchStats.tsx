import type { Match } from '@/core/models/match.model';
import { StatStrip, StatStripItem } from '@/ui/components/StatStrip';
import { countRequests } from '../lib/match-view';

interface MatchStatsProps {
  matches: Match[];
  viewer: 'Producer' | 'Professional';
}

/**
 * Resumen de las solicitudes en una tira de métricas (la fila de cifras de la referencia de tabla): cuántas hay, cuántas
 * esperan respuesta, cuántas se aceptaron y cuántas no siguieron.
 */
export default function MatchStats({ matches, viewer }: MatchStatsProps) {
  const counts = countRequests(matches);
  const isProducer = viewer === 'Producer';

  return (
    <StatStrip aria-label="Resumen de solicitudes">
      <StatStripItem
        label={isProducer ? 'Enviadas' : 'Recibidas'}
        value={counts.total}
        info={
          isProducer
            ? 'Todas las solicitudes que mandaste a profesionales.'
            : 'Todas las solicitudes que te mandaron productores.'
        }
        description="en total"
      />
      <StatStripItem
        label="Pendientes"
        value={counts.pending}
        info={
          isProducer
            ? 'Esperan que el profesional acepte o rechace.'
            : 'Esperan tu respuesta: aceptá o rechazá cada una.'
        }
        description={counts.pending > 0 ? 'esperando respuesta' : 'nada por responder'}
      />
      <StatStripItem
        label="Aceptadas"
        value={counts.accepted}
        info="Con la solicitud aceptada, las dos partes ven el contacto de la otra."
        description={
          counts.answered > 0
            ? `${counts.acceptanceRate} de las respondidas`
            : 'sin respuestas todavía'
        }
      />
      <StatStripItem
        label="Sin seguir"
        value={counts.closed}
        info="Rechazadas o canceladas."
        description="rechazadas o canceladas"
      />
    </StatStrip>
  );
}
