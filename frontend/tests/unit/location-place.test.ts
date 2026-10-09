import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveNamedPlace } from '@/core/services/location.service';

/** Productor de Berrotarán, Córdoba: el lugar de registro con el que se combina lo que escribe. */
const REGISTERED = { country: 'Argentina', province: 'Córdoba', city: 'Berrotarán' };

const georef = (...localities: Array<[string, string, number, number]>) =>
  new Response(
    JSON.stringify({
      localidades: localities.map(([nombre, provincia, lat, lon]) => ({
        nombre,
        provincia: { nombre: provincia },
        centroide: { lat, lon },
      })),
    })
  );

afterEach(() => vi.unstubAllGlobals());

describe('resolveNamedPlace', () => {
  it('treats the producer’s own province as their registered place (nearest to their field)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const place = await resolveNamedPlace('Córdoba', REGISTERED);

    expect(place?.label).toBe('Berrotarán, Córdoba');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses the center of another province without asking the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const place = await resolveNamedPlace('en Santa Fe', REGISTERED);

    expect(place?.label).toBe('Santa Fe');
    expect(place?.latitude).toBeLessThan(-27);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('recognizes the usual ways of writing Buenos Aires city', async () => {
    vi.stubGlobal('fetch', vi.fn());

    expect((await resolveNamedPlace('CABA', REGISTERED))?.label).toBe(
      'Ciudad Autónoma de Buenos Aires'
    );
  });

  it('finds a locality and prefers the producer’s province among namesakes', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          georef(
            ['San Francisco', 'Jujuy', -23.62, -64.95],
            ['San Francisco', 'Córdoba', -31.42, -62.08]
          )
        )
    );

    expect(await resolveNamedPlace('San Francisco', REGISTERED)).toEqual({
      latitude: -31.42,
      longitude: -62.08,
      label: 'San Francisco, Córdoba',
    });
  });

  it('respects the province the producer named over their own', async () => {
    const fetchMock = vi.fn().mockResolvedValue(georef(['San Francisco', 'Jujuy', -23.62, -64.95]));
    vi.stubGlobal('fetch', fetchMock);

    const place = await resolveNamedPlace('San Francisco, Jujuy', REGISTERED);

    expect(place?.label).toBe('San Francisco, Jujuy');
    expect(String(fetchMock.mock.calls[0][0])).toContain('provincia=Jujuy');
  });

  it('falls back to the local dataset when the official API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    expect((await resolveNamedPlace('Río Cuarto', REGISTERED))?.label).toBe('Río Cuarto, Córdoba');
  });

  it('searches the named province when the locality is unknown there', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(georef()));

    expect((await resolveNamedPlace('Lugarinexistente, Mendoza', REGISTERED))?.label).toBe(
      'Mendoza'
    );
  });

  it('returns null for a place it cannot find or for empty text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(georef()));

    expect(await resolveNamedPlace('Lugarinexistente', REGISTERED)).toBeNull();
    expect(await resolveNamedPlace('   ', REGISTERED)).toBeNull();
  });
});
