import { describe, expect, it } from 'vitest';
import type { GeoPoint } from '@/core/models/farm.model';
import {
  findOverlap,
  hasCrossingEdges,
  isOutsidePerimeter,
  openRing,
  parseCoordinates,
} from '@/features/farms/lib/lot-geometry';

const EARTH_RADIUS_METERS = 6378137;

/** Rectángulo de `widthMeters` (este-oeste) por `heightMeters` desde la esquina suroeste. */
function rectangle(
  south: number,
  west: number,
  widthMeters: number,
  heightMeters: number
): GeoPoint[] {
  const north = south + (heightMeters / EARTH_RADIUS_METERS) * (180 / Math.PI);
  const east =
    west +
    (widthMeters / (EARTH_RADIUS_METERS * Math.cos((south * Math.PI) / 180))) * (180 / Math.PI);
  return [
    { latitude: north, longitude: west },
    { latitude: north, longitude: east },
    { latitude: south, longitude: east },
    { latitude: south, longitude: west },
  ];
}

describe('dibujo del lote como referencia', () => {
  const perimeter = rectangle(-33.89, -60.6, 2000, 1000);
  const inside = rectangle(-33.888, -60.598, 500, 400);
  const outside = rectangle(-33.888, -60.55, 500, 400);

  it('devuelve las esquinas sin el punto de cierre del backend', () => {
    const closed = [...inside, inside[0]!];
    expect(openRing(closed)).toHaveLength(4);
    expect(openRing(inside)).toHaveLength(4);
  });

  it('detecta un borde que se cruza consigo mismo y deja pasar uno normal', () => {
    const [nw, ne, se, sw] = inside;
    expect(hasCrossingEdges([nw!, se!, ne!, sw!])).toBe(true);
    expect(hasCrossingEdges([nw!, ne!, se!, sw!])).toBe(false);
  });

  it('avisa si el dibujo queda afuera del perímetro, y sin perímetro no avisa', () => {
    expect(isOutsidePerimeter(inside, perimeter)).toBe(false);
    expect(isOutsidePerimeter(outside, perimeter)).toBe(true);
    expect(isOutsidePerimeter(outside, [])).toBe(false);
  });

  it('avisa con qué lote se encima, y compartir un borde no cuenta', () => {
    const lot = { label: 'Lote Norte', points: inside };
    const [nw, ne, se, sw] = inside;
    const neighbour = [
      ne!,
      { ...ne!, longitude: ne!.longitude + 0.005 },
      { ...se!, longitude: se!.longitude + 0.005 },
      se!,
    ];
    const overlapping = inside.map((p) => ({ ...p, longitude: p.longitude + 0.001 }));

    expect(findOverlap(neighbour, [lot])).toBeNull();
    expect(findOverlap(overlapping, [lot])?.label).toBe('Lote Norte');
    expect(findOverlap([nw!, sw!], [lot])).toBeNull();
  });
});

describe('coordenadas que pega el usuario', () => {
  it('entiende el formato de Google Maps', () => {
    expect(parseCoordinates('-33.8812, -60.5934')).toEqual({
      latitude: -33.8812,
      longitude: -60.5934,
    });
  });

  it('entiende coma decimal con punto y coma, y espacios', () => {
    expect(parseCoordinates('-33,8812; -60,5934')).toEqual({
      latitude: -33.8812,
      longitude: -60.5934,
    });
    expect(parseCoordinates('-33.8812 -60.5934')).toEqual({
      latitude: -33.8812,
      longitude: -60.5934,
    });
  });

  it('con hemisferio, sur y oeste son negativos', () => {
    expect(parseCoordinates('33.8812 S, 60.5934 O')).toEqual({
      latitude: -33.8812,
      longitude: -60.5934,
    });
    expect(parseCoordinates('33.8812° S, 60.5934° W')).toEqual({
      latitude: -33.8812,
      longitude: -60.5934,
    });
  });

  it('rechaza texto que no son coordenadas o que está fuera de rango', () => {
    expect(parseCoordinates('')).toBeNull();
    expect(parseCoordinates('Pergamino')).toBeNull();
    expect(parseCoordinates('-33.88')).toBeNull();
    expect(parseCoordinates('-95, -60')).toBeNull();
    expect(parseCoordinates('-33, -200')).toBeNull();
  });
});
