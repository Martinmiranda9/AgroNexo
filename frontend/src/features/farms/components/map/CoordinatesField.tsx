'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { MdOutlineMyLocation } from 'react-icons/md';
import type { GeoPoint } from '@/core/models/farm.model';
import { Button } from '@/ui/components/Button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import { Input } from '@/ui/components/Input';
import { parseCoordinates } from '../../lib/lot-geometry';

interface CoordinatesFieldProps {
  /** Las coordenadas se entendieron: el mapa vuela ahí. */
  onGo: (point: GeoPoint) => void;
  label?: string;
}

/**
 * Coordenadas para no buscar el campo desde arriba: el usuario pega latitud y longitud (como las copia Google Maps) y
 * el mapa lo lleva hasta ese punto.
 */
export default function CoordinatesField({
  onGo,
  label = 'Ir a unas coordenadas',
}: CoordinatesFieldProps) {
  const id = useId();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const go = () => {
    const point = parseCoordinates(text);
    if (!point) {
      setError('No entendimos las coordenadas. Escribilas como -33.8812, -60.5934.');
      return;
    }
    setError(null);
    onGo(point);
  };

  // Enter va al punto en vez de enviar el formulario.
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    go();
  };

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={id}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="-33.8812, -60.5934"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={error !== null}
        />
        <Button type="button" variant="outline" onClick={go} disabled={!text.trim()}>
          <MdOutlineMyLocation data-icon="inline-start" aria-hidden />
          Ir al punto
        </Button>
      </div>
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        <FieldDescription>
          Pegá la latitud y la longitud de tu campo (por ejemplo, desde Google Maps) y el mapa te
          lleva ahí.
        </FieldDescription>
      )}
    </Field>
  );
}
