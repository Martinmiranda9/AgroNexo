import type { GeoPoint } from '@/core/models/farm.model';

/**
 * Geometría de los dibujos en el mapa. El dibujo solo ubica el lote o el campo: las hectáreas son siempre las que se
 * declaran. Lo que se chequea acá sirve para avisar (afuera del perímetro, encima de otro lote) y para no mandar un
 * borde cruzado, que es lo único que el backend rechaza.
 */

/** Las esquinas sin el punto de cierre: el backend devuelve el anillo cerrado (el último repite el primero). */
export function openRing(points: GeoPoint[]): GeoPoint[] {
  const first = points[0];
  const last = points[points.length - 1];
  const closed =
    points.length > 1 &&
    first !== undefined &&
    last !== undefined &&
    first.latitude === last.latitude &&
    first.longitude === last.longitude;
  return closed ? points.slice(0, -1) : points;
}

/** Hacia qué lado queda `c` de la recta `a → b`: 1, -1 o 0 si están alineados. */
const orientation = (a: GeoPoint, b: GeoPoint, c: GeoPoint) =>
  Math.sign(
    (b.longitude - a.longitude) * (c.latitude - a.latitude) -
      (b.latitude - a.latitude) * (c.longitude - a.longitude)
  );

/** Los tramos `a-b` y `c-d` se cortan en un punto interior (tocarse o ir alineados no cuenta). */
const segmentsCross = (a: GeoPoint, b: GeoPoint, c: GeoPoint, d: GeoPoint) =>
  orientation(a, b, c) * orientation(a, b, d) < 0 &&
  orientation(c, d, a) * orientation(c, d, b) < 0;

const edgesOf = (corners: GeoPoint[]) =>
  corners.map((point, i) => [point, corners[(i + 1) % corners.length]!] as const);

/** El punto está apoyado sobre un tramo del borde (alineado y entre sus dos esquinas). */
const isOnEdge = (point: GeoPoint, a: GeoPoint, b: GeoPoint) =>
  orientation(a, b, point) === 0 &&
  point.latitude >= Math.min(a.latitude, b.latitude) &&
  point.latitude <= Math.max(a.latitude, b.latitude) &&
  point.longitude >= Math.min(a.longitude, b.longitude) &&
  point.longitude <= Math.max(a.longitude, b.longitude);

/** El punto cae adentro del polígono (rayo hacia el este). Apoyado sobre el borde no cuenta como adentro. */
function isInside(point: GeoPoint, corners: GeoPoint[]): boolean {
  if (edgesOf(corners).some(([a, b]) => isOnEdge(point, a, b))) return false;
  let inside = false;
  for (const [a, b] of edgesOf(corners)) {
    const crossesLatitude = a.latitude > point.latitude !== b.latitude > point.latitude;
    if (!crossesLatitude) continue;
    const longitudeAtPoint =
      a.longitude +
      ((point.latitude - a.latitude) / (b.latitude - a.latitude)) * (b.longitude - a.longitude);
    if (point.longitude < longitudeAtPoint) inside = !inside;
  }
  return inside;
}

/** Promedio de las esquinas: para un lote dibujado a mano cae adentro del dibujo. */
const centerOf = (corners: GeoPoint[]): GeoPoint => ({
  latitude: corners.reduce((sum, p) => sum + p.latitude, 0) / corners.length,
  longitude: corners.reduce((sum, p) => sum + p.longitude, 0) / corners.length,
});

/** Dos tramos del borde se cruzan (un "moño"): el backend lo rechaza, así que se avisa antes de enviar. */
export function hasCrossingEdges(points: GeoPoint[]): boolean {
  const corners = openRing(points);
  const n = corners.length;
  if (n < 4) return false;

  const edges = edgesOf(corners);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // Tramos vecinos comparten una esquina: no cuentan como cruce.
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      const [a, b] = edges[i]!;
      const [c, d] = edges[j]!;
      if (segmentsCross(a, b, c, d)) return true;
    }
  }
  return false;
}

/** Alguna esquina del dibujo queda afuera del perímetro del campo. Sin perímetro, nunca. */
export function isOutsidePerimeter(points: GeoPoint[], perimeter: GeoPoint[]): boolean {
  const ring = openRing(perimeter);
  if (ring.length < 3) return false;
  return openRing(points).some((point) => !isInside(point, ring));
}

/**
 * El primer lote dibujado que el dibujo pisa: se cruzan sus bordes o uno queda adentro del otro. Compartir un borde
 * no cuenta. `null` si no pisa ninguno.
 */
export function findOverlap<T extends { label: string; points: GeoPoint[] }>(
  points: GeoPoint[],
  shapes: T[]
): T | null {
  const corners = openRing(points);
  if (corners.length < 3) return null;

  return (
    shapes.find((shape) => {
      const other = openRing(shape.points);
      if (other.length < 3) return false;
      const bordersCross = edgesOf(corners).some(([a, b]) =>
        edgesOf(other).some(([c, d]) => segmentsCross(a, b, c, d))
      );
      // Esquinas o centro de uno adentro del otro (el centro cubre dos lotes corridos con los bordes alineados).
      const ownPoints = [...corners, centerOf(corners)];
      const otherPoints = [...other, centerOf(other)];
      return (
        bordersCross ||
        ownPoints.some((p) => isInside(p, other)) ||
        otherPoints.some((p) => isInside(p, corners))
      );
    }) ?? null
  );
}

/** Una coordenada: número con signo y, opcional, hemisferio (S, N, O, W, E). */
const COORDINATE_PART = /^(-?\d+(?:\.\d+)?)\s*°?\s*([NSEOW])?$/i;

function parsePart(part: string): number | null {
  const match = COORDINATE_PART.exec(part.trim());
  if (!match) return null;
  const value = Number(match[1]);
  const hemisphere = match[2]?.toUpperCase();
  // Sur y oeste son negativos, aunque se escriban sin el signo ("33.88 S, 60.59 O").
  return hemisphere === 'S' || hemisphere === 'W' || hemisphere === 'O' ? -Math.abs(value) : value;
}

/**
 * Lee "latitud, longitud" como la copia Google Maps (`-33.8812, -60.5934`), con punto y coma y coma decimal
 * (`-33,8812; -60,5934`), separada por espacios o con hemisferio (`33.88 S 60.59 O`). `null` si no se entiende o
 * está fuera de rango.
 */
export function parseCoordinates(text: string): GeoPoint | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const parts = trimmed.includes(';')
    ? trimmed.split(';').map((part) => part.replace(',', '.'))
    : trimmed.includes(',')
      ? trimmed.split(',')
      : trimmed.split(/\s+(?=-?\d)/);
  if (parts.length !== 2) return null;

  const latitude = parsePart(parts[0]!);
  const longitude = parsePart(parts[1]!);
  if (latitude === null || longitude === null) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}
