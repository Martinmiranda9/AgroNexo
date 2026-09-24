import type { Coordinate } from '@/core/models/identity.model';

const KM_PER_DEGREE = 111.32;
const VERTICES = 12;

/** Aproxima un círculo de `radiusKm` alrededor de un punto con un polígono de 12 vértices. */
export function buildCoveragePolygon(latitude: number, longitude: number, radiusKm: number): Coordinate[] {
  const latOffset = radiusKm / KM_PER_DEGREE;
  const lngOffset = radiusKm / (KM_PER_DEGREE * Math.cos((latitude * Math.PI) / 180));

  return Array.from({ length: VERTICES }, (_, i) => {
    const angle = (2 * Math.PI * i) / VERTICES;
    return {
      latitude: Number((latitude + latOffset * Math.sin(angle)).toFixed(6)),
      longitude: Number((longitude + lngOffset * Math.cos(angle)).toFixed(6)),
    };
  });
}
