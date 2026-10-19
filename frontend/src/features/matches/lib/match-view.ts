import type { Match } from '@/core/models/match.model';
import type { NeedBrief } from '@/shared/types/need-brief';

const NO_BRIEF_TEXT = 'El productor no adjuntó una descripción de lo que necesita.';

/** La ficha de la solicitud; los creados antes de que existiera (o sin ella) muestran un texto neutro. */
export function briefOf(match: Match): NeedBrief {
  return match.needBrief ?? { summary: NO_BRIEF_TEXT, topics: [], crops: [] };
}

const relativeFormat = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });

/** "hace 5 minutos", "ayer", "hace 3 días"; pasadas dos semanas, la fecha. */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const requested = new Date(iso).getTime();
  if (Number.isNaN(requested)) return '';

  const seconds = Math.round((requested - now) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(seconds) < 60) return 'hace un momento';
  if (Math.abs(minutes) < 60) return relativeFormat.format(minutes, 'minute');
  if (Math.abs(hours) < 24) return relativeFormat.format(hours, 'hour');
  if (Math.abs(days) <= 14) return relativeFormat.format(days, 'day');
  return new Date(requested).toLocaleDateString('es-AR');
}

/** Primero los pendientes (lo que espera respuesta), después el resto; en cada grupo el más reciente arriba. */
export function sortRequests(matches: Match[]): Match[] {
  const rank = (match: Match) => (match.status === 'Pending' ? 0 : 1);
  return [...matches].sort(
    (a, b) => rank(a) - rank(b) || Date.parse(b.requestedAt) - Date.parse(a.requestedAt)
  );
}

const PERCENT = new Intl.NumberFormat('es-AR', { style: 'percent', maximumFractionDigits: 0 });

/** Cuentas de la tira de métricas. La tasa de aceptación se calcula sobre las que ya tuvieron respuesta. */
export function countRequests(matches: Match[]) {
  const pending = matches.filter((match) => match.status === 'Pending').length;
  const accepted = matches.filter(
    (match) => match.status === 'Active' || match.status === 'Completed'
  ).length;
  const closed = matches.filter(
    (match) => match.status === 'Rejected' || match.status === 'Cancelled'
  ).length;
  const answered = accepted + closed;
  return {
    total: matches.length,
    pending,
    accepted,
    closed,
    answered,
    acceptanceRate: answered > 0 ? PERCENT.format(accepted / answered) : '—',
  };
}
