'use client';

import { MdOutlineDelete, MdUndo, MdWarningAmber } from 'react-icons/md';
import type { GeoPoint } from '@/core/models/farm.model';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import type { MapShape } from '@/ui/components/FieldMap';
import LazyFieldMap from './LazyFieldMap';

const cornersLabel = (count: number) => (count === 1 ? '1 esquina' : `${count} esquinas`);

interface DrawingMapPanelProps {
  /** "Ubicación del lote (opcional)", "Perímetro del campo (opcional)". */
  label: string;
  /** Perímetro del campo (sin el punto de cierre), de referencia. */
  perimeter?: GeoPoint[];
  /** Lotes ya dibujados, de referencia. */
  shapes?: MapShape[];
  /** Esquinas del dibujo. */
  value: GeoPoint[];
  /** Sin esta función, el mapa es solo de consulta. */
  onChange?: (points: GeoPoint[]) => void;
  /** Coordenadas a las que volar. */
  focus: GeoPoint | null;
  /** Lo que impide guardar (un borde cruzado, un dibujo a medio hacer). */
  error?: string | null;
  /** Avisos que no impiden guardar (afuera del perímetro, encima de otro lote). */
  warnings?: string[];
  'aria-label': string;
}

/**
 * El lado del mapa en los formularios de pantalla completa: el mapa grande para ubicar el lote o el campo, cuántas
 * esquinas lleva el dibujo y las acciones para deshacer la última o empezar de nuevo. El dibujo es solo referencia: no
 * calcula hectáreas.
 */
export default function DrawingMapPanel({
  label,
  perimeter,
  shapes,
  value,
  onChange,
  focus,
  error,
  warnings = [],
  'aria-label': ariaLabel,
}: DrawingMapPanelProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <FieldLabel>{label}</FieldLabel>
        <FieldDescription>
          {onChange
            ? 'Tocá el mapa en cada esquina para ubicarlo. Para corregir una esquina, arrastrala.'
            : 'El mapa muestra el campo y los lotes ya dibujados.'}
        </FieldDescription>
      </div>

      <div className="min-h-0 flex-1">
        <LazyFieldMap
          size="fill"
          perimeter={perimeter}
          shapes={shapes}
          value={value}
          onChange={onChange}
          focus={focus}
          aria-label={ariaLabel}
        />
      </div>

      {onChange && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-body-sm text-muted-foreground" aria-live="polite">
            {value.length === 0
              ? 'Sin dibujar: podés guardarlo igual.'
              : value.length < 3
                ? `${cornersLabel(value.length)} de al menos 3`
                : `Dibujado · ${cornersLabel(value.length)}`}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={value.length === 0}
              onClick={() => onChange(value.slice(0, -1))}
            >
              <MdUndo data-icon="inline-start" aria-hidden />
              Deshacer esquina
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={value.length === 0}
              onClick={() => onChange([])}
            >
              <MdOutlineDelete data-icon="inline-start" aria-hidden />
              Borrar dibujo
            </Button>
          </div>
        </div>
      )}
      {error && <FieldError>{error}</FieldError>}
      {warnings.map((warning) => (
        <Alert key={warning} variant="warning">
          <MdWarningAmber aria-hidden />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      ))}
    </>
  );
}
