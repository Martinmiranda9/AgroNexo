'use client';

import { useState } from 'react';
import { createFarmActivityAction } from '@/core/actions/create-farm-activity.action';
import {
  ACTIVITY_NOTES_MAX,
  ACTIVITY_TITLE_MAX,
  type FarmActivity,
  type FarmActivityStatus,
  type FarmActivityType,
  type Lot,
} from '@/core/models/farm-dashboard.model';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import { Input } from '@/ui/components/Input';
import { NativeSelect, NativeSelectOption } from '@/ui/components/NativeSelect';
import { NumberInput } from '@/ui/components/NumberInput';
import { Textarea } from '@/ui/components/Textarea';
import { ToggleGroup, ToggleGroupItem } from '@/ui/components/ToggleGroup';
import {
  ACTIVITY_STATUS_LABEL,
  ACTIVITY_STATUS_OPTIONS,
  ACTIVITY_TYPE_LABEL,
  ACTIVITY_TYPE_OPTIONS,
  isFieldLabor,
  todayIso,
} from '../../lib/dashboard-view';
import FormDrawer, { FormShell, failureCopy } from './FormDrawer';

const WHOLE_FARM = '';

interface ActivityFormProps {
  farmId: string;
  lots: Lot[];
  onClose: () => void;
  onCreated: (activity: FarmActivity) => void;
}

function ActivityForm({ farmId, lots, onClose, onCreated }: ActivityFormProps) {
  const [type, setType] = useState<FarmActivityType>('Sowing');
  const [title, setTitle] = useState('');
  const [lotId, setLotId] = useState(WHOLE_FARM);
  const [date, setDate] = useState(todayIso());
  const [status, setStatus] = useState<FarmActivityStatus>('Started');
  const [hectares, setHectares] = useState<number>(NaN);
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);

  const lot = lots.find((l) => l.id === lotId) ?? null;
  const showHectares = isFieldLabor(type) && lot !== null && status !== 'Started';
  const titleError = title.trim() ? null : 'Contá en pocas palabras qué se hizo.';
  const dateError = date ? null : 'Elegí la fecha.';
  const hectaresError =
    showHectares && Number.isFinite(hectares) && lot && hectares > lot.hectares
      ? `El lote tiene ${lot.hectares} ha.`
      : null;

  const submit = async () => {
    const outcome = await createFarmActivityAction(farmId, {
      type,
      title,
      notes: notes || null,
      date,
      status,
      lotId: lot?.id ?? null,
      hectaresWorked: showHectares && Number.isFinite(hectares) ? hectares : null,
    });
    if (outcome.status === 'ok') {
      onCreated(outcome.data);
      return null;
    }
    return failureCopy(outcome);
  };

  return (
    <FormShell
      onClose={onClose}
      title="Nueva actividad"
      description="Lo que se hizo o se está haciendo en el campo. La ve todo el equipo."
      submitLabel="Registrar actividad"
      pendingLabel="Registrando…"
      validate={() => {
        setTouched(true);
        return !titleError && !dateError && !hectaresError;
      }}
      onSubmit={submit}
    >
      <Field>
        <FieldLabel htmlFor="activity-type">Tipo</FieldLabel>
        <NativeSelect
          id="activity-type"
          value={type}
          onChange={(event) => setType(event.target.value as FarmActivityType)}
        >
          {ACTIVITY_TYPE_OPTIONS.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {ACTIVITY_TYPE_LABEL[option]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field data-invalid={touched && titleError ? true : undefined}>
        <FieldLabel htmlFor="activity-title">Qué se hizo</FieldLabel>
        <Input
          id="activity-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Siembra de soja de primera"
          maxLength={ACTIVITY_TITLE_MAX}
          autoComplete="off"
          aria-invalid={touched && titleError !== null}
          aria-describedby={touched && titleError ? 'activity-title-error' : undefined}
          autoFocus
        />
        {touched && titleError && <FieldError id="activity-title-error">{titleError}</FieldError>}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="activity-lot">Lote</FieldLabel>
          <NativeSelect
            id="activity-lot"
            value={lotId}
            onChange={(event) => setLotId(event.target.value)}
          >
            <NativeSelectOption value={WHOLE_FARM}>Todo el campo</NativeSelectOption>
            {lots.map((l) => (
              <NativeSelectOption key={l.id} value={l.id}>
                {l.name} · {l.hectares} ha
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field data-invalid={touched && dateError ? true : undefined}>
          <FieldLabel htmlFor="activity-date">Fecha</FieldLabel>
          <Input
            id="activity-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-invalid={touched && dateError !== null}
          />
          {touched && dateError && <FieldError>{dateError}</FieldError>}
        </Field>
      </div>

      <Field>
        <FieldLabel id="activity-status-label">Estado</FieldLabel>
        <ToggleGroup
          aria-labelledby="activity-status-label"
          variant="segmented"
          spacing={2}
          value={[status]}
          onValueChange={(next) => {
            if (next[0]) setStatus(next[0] as FarmActivityStatus);
          }}
          className="w-max"
        >
          {ACTIVITY_STATUS_OPTIONS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {ACTIVITY_STATUS_LABEL[option]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      {showHectares && (
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="activity-hectares">Hectáreas trabajadas (opcional)</FieldLabel>
          <NumberInput
            id="activity-hectares"
            name="activity-hectares"
            className="max-w-64"
            min={0}
            max={lot?.hectares}
            value={hectares}
            onValueChange={setHectares}
          />
          <p className="text-caption text-muted-foreground">
            {hectaresError ??
              (status === 'Completed'
                ? `Si lo dejás vacío, cuenta el lote entero (${lot?.hectares} ha).`
                : 'Lo que lleva hecho, para el avance de labores.')}
          </p>
        </div>
      )}

      <Field>
        <FieldLabel htmlFor="activity-notes">Notas (opcional)</FieldLabel>
        <Textarea
          id="activity-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Densidad, producto, observaciones del lote…"
          maxLength={ACTIVITY_NOTES_MAX}
          rows={3}
          aria-describedby="activity-notes-hint"
        />
        <FieldDescription id="activity-notes-hint">
          No pongas teléfonos ni datos personales: lo lee todo el equipo.
        </FieldDescription>
      </Field>
    </FormShell>
  );
}

interface NewActivityDrawerProps extends ActivityFormProps {
  open: boolean;
}

/** Alta de una actividad del campo, para el productor o cualquier profesional del equipo. */
export default function NewActivityDrawer({ open, ...props }: NewActivityDrawerProps) {
  return (
    <FormDrawer open={open} onClose={props.onClose}>
      <ActivityForm {...props} />
    </FormDrawer>
  );
}
