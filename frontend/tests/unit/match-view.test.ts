import { describe, expect, it } from 'vitest';
import type { Match } from '@/core/models/match.model';
import { briefOf, relativeTime, sortRequests } from '@/features/matches/lib/match-view';

const NOW = Date.parse('2026-10-06T12:00:00Z');
const hoursAgo = (hours: number) => new Date(NOW - hours * 3_600_000).toISOString();

const match = (overrides: Partial<Match>): Match => ({
  id: 'm1',
  producerId: 'p1',
  producerName: 'Esteban Bauer',
  professionalId: 'pr1',
  professionalName: 'Maria Gomez',
  specialty: 'Impuestos agropecuarios',
  status: 'Pending',
  requestedAt: hoursAgo(1),
  respondedAt: null,
  needBrief: null,
  ...overrides,
});

describe('relativeTime', () => {
  it('speaks in minutes, hours and days, in Spanish', () => {
    expect(relativeTime(hoursAgo(0), NOW)).toBe('hace un momento');
    expect(relativeTime(new Date(NOW - 5 * 60_000).toISOString(), NOW)).toBe('hace 5 minutos');
    expect(relativeTime(hoursAgo(3), NOW)).toBe('hace 3 horas');
    expect(relativeTime(hoursAgo(24), NOW)).toBe('ayer');
    expect(relativeTime(hoursAgo(24 * 4), NOW)).toBe('hace 4 días');
  });

  it('shows the date after two weeks and tolerates an invalid one', () => {
    expect(relativeTime(hoursAgo(24 * 30), NOW)).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(relativeTime('no es una fecha', NOW)).toBe('');
  });
});

describe('sortRequests', () => {
  it('puts pending ones first, newest first inside each group, without mutating the input', () => {
    const list = [
      match({ id: 'old-accepted', status: 'Active', requestedAt: hoursAgo(1) }),
      match({ id: 'old-pending', requestedAt: hoursAgo(30) }),
      match({ id: 'new-pending', requestedAt: hoursAgo(2) }),
      match({ id: 'rejected', status: 'Rejected', requestedAt: hoursAgo(5) }),
    ];

    expect(sortRequests(list).map((m) => m.id)).toEqual([
      'new-pending',
      'old-pending',
      'old-accepted',
      'rejected',
    ]);
    expect(list[0].id).toBe('old-accepted');
  });
});

describe('briefOf', () => {
  it('returns the brief when the request has one', () => {
    const needBrief = {
      summary: 'Productor de Córdoba, necesita un contador.',
      topics: [],
      crops: [],
    };

    expect(briefOf(match({ needBrief }))).toBe(needBrief);
  });

  it('gives a neutral text to requests created without one', () => {
    expect(briefOf(match({ needBrief: null }))).toMatchObject({
      summary: expect.stringContaining('no adjuntó'),
      topics: [],
      crops: [],
    });
  });
});
