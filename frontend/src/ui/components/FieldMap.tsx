'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

/** Punto del mapa en WGS84, con los mismos nombres que la API. */
export interface MapPoint {
  latitude: number;
  longitude: number;
}

/** Forma de referencia (otro lote): se ve con su nombre pero no se edita. */
export interface MapShape {
  id: string;
  label: string;
  points: MapPoint[];
}

const fieldMapVariants = cva('border-border z-0 w-full overflow-hidden rounded-xl border', {
  variants: {
    size: {
      /** Alto fijo, para un mapa dentro de un formulario o una card. */
      default: 'h-80',
      /** Ocupa todo el alto de su contenedor (pantalla completa, popup grande). */
      fill: 'h-full min-h-80',
    },
  },
  defaultVariants: { size: 'default' },
});

export interface FieldMapProps extends VariantProps<typeof fieldMapVariants> {
  /** Perímetro del campo, si está dibujado. */
  perimeter?: MapPoint[];
  /** Lotes del campo, de referencia. */
  shapes?: MapShape[];
  /** Lote a resaltar entre `shapes`: se pinta como el dibujo y el mapa arranca encuadrado en él. */
  highlightId?: string;
  /** Esquinas del dibujo, en orden. */
  value?: MapPoint[];
  /** Con esta función el mapa se dibuja: cada toque agrega una esquina y cada esquina se puede arrastrar. */
  onChange?: (points: MapPoint[]) => void;
  /** Punto al que volar (por ejemplo, coordenadas que cargó el usuario). Cada objeto nuevo vuelve a volar. */
  focus?: MapPoint | null;
  'aria-label'?: string;
}

/** Imagen satelital de Esri (World Imagery) y la capa transparente con límites y nombres de lugares. */
const SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const PLACE_NAMES_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
const ATTRIBUTION = 'Imágenes © Esri, Maxar, Earthstar Geographics';

/** Sin nada dibujado todavía: la región pampeana. */
const DEFAULT_CENTER: L.LatLngTuple = [-34.6, -61.2];
const DEFAULT_ZOOM = 6;
/** Zoom al ir a unas coordenadas: se ven los alambrados de los lotes. */
const FOCUS_ZOOM = 16;
const MAX_ZOOM = 19;

/** Los colores salen de los tokens por clase: Leaflet dibuja en SVG y la clase le gana al atributo. */
const PERIMETER_STYLE: L.PathOptions = {
  className: 'stroke-sage-50 fill-transparent',
  weight: 2,
  dashArray: '6 6',
  opacity: 1,
  fillOpacity: 1,
  interactive: false,
};
const SHAPE_STYLE: L.PathOptions = {
  className: 'stroke-sage-100 fill-sage-100/15',
  weight: 2,
  opacity: 1,
  fillOpacity: 1,
  interactive: false,
};
const DRAFT_STYLE: L.PathOptions = {
  className: 'stroke-field-300 fill-field-300/30',
  weight: 3,
  opacity: 1,
  fillOpacity: 1,
  interactive: false,
};

const LABEL_CLASS =
  'bg-pine/75! text-sage-50! border-0! shadow-none! rounded-full! px-2! py-0.5! text-caption! font-medium! before:hidden!';

const VERTEX_ICON = L.divIcon({
  className: '',
  html: '<span class="block size-3.5 rounded-full border-2 border-card bg-primary shadow-md"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/** El punto de las coordenadas cargadas: un aro, para que no se confunda con una esquina. */
const FOCUS_ICON = L.divIcon({
  className: '',
  html: '<span class="block size-5 rounded-full border-[3px] border-card bg-pine/40 shadow-md"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const toLatLng = (point: MapPoint): L.LatLngTuple => [point.latitude, point.longitude];
const toPoint = (latLng: L.LatLng): MapPoint => ({ latitude: latLng.lat, longitude: latLng.lng });

/**
 * Mapa satelital del campo con Leaflet. Muestra el perímetro y los lotes de referencia, puede volar a unas
 * coordenadas y, con `onChange`, permite dibujar un lote tocando sus esquinas. Usa `window`: se carga con
 * `next/dynamic` y `ssr: false`.
 */
export function FieldMap({
  perimeter,
  shapes,
  highlightId,
  value = [],
  onChange,
  focus,
  size,
  'aria-label': ariaLabel = 'Mapa satelital del campo',
}: FieldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const referenceLayer = useRef<L.LayerGroup | null>(null);
  const draftLayer = useRef<L.LayerGroup | null>(null);
  const focusLayer = useRef<L.LayerGroup | null>(null);
  // El clic del mapa se registra una sola vez: lee el dibujo y el callback más recientes desde acá.
  const latest = useRef({ value, onChange });
  useEffect(() => {
    latest.current = { value, onChange };
  }, [value, onChange]);

  const editable = Boolean(onChange);

  // Crea el mapa una vez y lo encuadra: en el lote resaltado, o en todo lo que ya hay dibujado.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, { maxZoom: MAX_ZOOM, zoomControl: true });
    L.tileLayer(SATELLITE_URL, { maxZoom: MAX_ZOOM, attribution: ATTRIBUTION }).addTo(map);
    L.tileLayer(PLACE_NAMES_URL, { maxZoom: MAX_ZOOM }).addTo(map);
    referenceLayer.current = L.layerGroup().addTo(map);
    draftLayer.current = L.layerGroup().addTo(map);
    focusLayer.current = L.layerGroup().addTo(map);

    const highlighted = shapes?.find((s) => s.id === highlightId && s.points.length >= 3);
    const known = highlighted
      ? highlighted.points
      : [...(perimeter ?? []), ...(shapes ?? []).flatMap((s) => s.points), ...value];
    if (known.length > 0)
      map.fitBounds(L.latLngBounds(known.map(toLatLng)), { padding: [32, 32], maxZoom: 17 });
    else map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    map.on('click', (event: L.LeafletMouseEvent) => {
      const { value: points, onChange: change } = latest.current;
      change?.([...points, toPoint(event.latlng)]);
    });

    // El contenedor cambia de tamaño (un drawer que se abre, la pantalla que se achica): Leaflet tiene que enterarse.
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(container);

    mapRef.current = map;
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // El encuadre inicial usa los datos del primer render; después se actualizan las capas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = mapRef.current?.getContainer();
    if (container) container.style.cursor = editable ? 'crosshair' : '';
  }, [editable]);

  // Perímetro y lotes de referencia.
  useEffect(() => {
    const layer = referenceLayer.current;
    if (!layer) return;
    layer.clearLayers();

    if (perimeter && perimeter.length >= 3)
      L.polygon(perimeter.map(toLatLng), PERIMETER_STYLE).addTo(layer);
    for (const shape of shapes ?? []) {
      if (shape.points.length < 3) continue;
      L.polygon(shape.points.map(toLatLng), shape.id === highlightId ? DRAFT_STYLE : SHAPE_STYLE)
        .bindTooltip(shape.label, { permanent: true, direction: 'center', className: LABEL_CLASS })
        .addTo(layer);
    }
  }, [perimeter, shapes, highlightId]);

  // Lo que se está dibujando: el contorno y una esquina arrastrable por punto.
  useEffect(() => {
    const layer = draftLayer.current;
    if (!layer) return;
    layer.clearLayers();

    const latLngs = value.map(toLatLng);
    if (latLngs.length >= 3) L.polygon(latLngs, DRAFT_STYLE).addTo(layer);
    else if (latLngs.length === 2) L.polyline(latLngs, DRAFT_STYLE).addTo(layer);

    if (!editable) return;
    value.forEach((point, index) => {
      const marker = L.marker(toLatLng(point), {
        icon: VERTEX_ICON,
        draggable: true,
        keyboard: false,
        title: `Esquina ${index + 1}`,
      });
      marker.on('dragend', () => {
        const { value: points, onChange: change } = latest.current;
        change?.(points.map((p, i) => (i === index ? toPoint(marker.getLatLng()) : p)));
      });
      marker.addTo(layer);
    });
  }, [value, editable]);

  // Coordenadas cargadas: vuela hasta ahí y deja un aro en el punto.
  useEffect(() => {
    const map = mapRef.current;
    const layer = focusLayer.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!focus) return;

    L.marker(toLatLng(focus), { icon: FOCUS_ICON, interactive: false, keyboard: false }).addTo(
      layer
    );
    map.flyTo(toLatLng(focus), Math.max(map.getZoom(), FOCUS_ZOOM), { duration: 1.2 });
  }, [focus]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={ariaLabel}
      className={cn(fieldMapVariants({ size }))}
    />
  );
}

export default FieldMap;
