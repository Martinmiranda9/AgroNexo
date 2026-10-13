import type { ReactNode } from 'react';
import type { Match } from '@/core/models/match.model';
import { sortRequests } from '../lib/match-view';
import MatchRequestCard from './MatchRequestCard';

interface MatchRequestListProps {
  matches: Match[];
  viewer: 'Producer' | 'Professional';
  /** Acción extra bajo el contacto de un match aceptado (la página compone, por ejemplo, "Sumar a un campo"). */
  renderActiveAction?: (match: Match) => ReactNode;
}

/** Solicitudes de match en una grilla: primero los que esperan respuesta. */
export default function MatchRequestList({
  matches,
  viewer,
  renderActiveAction,
}: MatchRequestListProps) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {sortRequests(matches).map((match) => (
        <li key={match.id} className="min-w-0">
          <MatchRequestCard
            match={match}
            viewer={viewer}
            activeAction={match.status === 'Active' ? renderActiveAction?.(match) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
