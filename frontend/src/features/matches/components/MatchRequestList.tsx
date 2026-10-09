import type { Match } from '@/core/models/match.model';
import { sortRequests } from '../lib/match-view';
import MatchRequestCard from './MatchRequestCard';

interface MatchRequestListProps {
  matches: Match[];
  viewer: 'Producer' | 'Professional';
}

/** Solicitudes de match en una grilla: primero los que esperan respuesta. */
export default function MatchRequestList({ matches, viewer }: MatchRequestListProps) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {sortRequests(matches).map((match) => (
        <li key={match.id} className="min-w-0">
          <MatchRequestCard match={match} viewer={viewer} />
        </li>
      ))}
    </ul>
  );
}
