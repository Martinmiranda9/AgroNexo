import { describe, expect, it } from 'vitest';
import type { Workspace } from '@/core/models/farm.model';
import { homeRouteFor } from '@/core/services/home-route.service';

const farm = (overrides: Partial<Workspace>): Workspace => ({
  farmId: 'f1',
  publicId: 200001,
  name: 'La Esperanza',
  description: null,
  totalHectares: 420,
  createdAt: '2026-08-01T00:00:00Z',
  archivedAt: null,
  producerId: 'p1',
  producerName: 'Esteban Bauer',
  viewerRole: 'Owner',
  myMemberId: null,
  producerContact: null,
  members: [],
  ...overrides,
});

describe('homeRouteFor: a dónde entra el usuario después del login', () => {
  it('con un campo en uso entra a su tablero', () => {
    expect(homeRouteFor('Producer', [farm({ farmId: 'abc' })])).toBe('/farms/abc');
    expect(homeRouteFor('Professional', [farm({ farmId: 'abc' })])).toBe('/farms/abc');
  });

  it('con varios campos entra al primero por nombre, como en la lista de Campos', () => {
    const workspaces = [
      farm({ farmId: 'z', name: 'Santa Rosa' }),
      farm({ farmId: 'a', name: 'El Ombú' }),
    ];
    expect(homeRouteFor('Producer', workspaces)).toBe('/farms/a');
  });

  it('los campos archivados no cuentan', () => {
    const archived = [farm({ archivedAt: '2026-09-01T00:00:00Z' })];
    expect(homeRouteFor('Producer', archived)).toBe('/match-discovery');
  });

  it('sin campos, el productor va a Buscar y el profesional a su Panel', () => {
    expect(homeRouteFor('Producer', [])).toBe('/match-discovery');
    expect(homeRouteFor('Professional', [])).toBe('/dashboard');
  });

  it('si los campos no se pudieron traer, entra a la pantalla de su rol', () => {
    expect(homeRouteFor('Producer', null)).toBe('/match-discovery');
    expect(homeRouteFor('Professional', null)).toBe('/dashboard');
  });
});
