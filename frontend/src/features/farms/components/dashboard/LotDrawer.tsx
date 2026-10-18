'use client';

import { useState } from 'react';
import { addLotCropAction } from '@/core/actions/add-lot-crop.action';
import { createLotAction } from '@/core/actions/create-lot.action';
import {
  LOT_NAME_MAX,
  type Campaign,
  type CropType,
  type Lot,
} from '@/core/models/farm-dashboard.model';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import { Input } from '@/ui/components/Input';
import { NativeSelect, NativeSelectOption } from '@/ui/components/NativeSelect';
import { NumberInput } from '@/ui/components/NumberInput';
import { CROP_OPTIONS, cropLabel } from '../../lib/dashboard-view';
import FormDrawer, { FormShell, failureCopy } from './FormDrawer';

const NO_CROP = '';

/** `new`: lote nuevo (con su cultivo opcional). `crop`: cultivo para un lote que ya existe. */
export type LotDrawerMode = { kind: 'new' } | { kind: 'crop'; lot: Lot };

interface LotFormProps {
  farmId: string;
  mode: LotDrawerMode;
  /** Campaña elegida en el tablero: el cultivo se carga ahí. Sin campaña, el lote va sin cultivo. */
  campaign: Campaign | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function LotForm({ farmId, mode, campaign, onClose, onSaved }: LotFormProps) {
  const isNew = mode.kind === 'new';
  const [name, setName] = useState('');
  const [hectares, setHectares] = useState<number>(NaN);
  const [crop, setCrop] = useState<CropType | typeof NO_CROP>(isNew ? NO_CROP : 'Soybean');
  const [sowingDate, setSowingDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [touched, setTouched] = useState(false);

  const nameError = isNew && !name.trim() ? 'Poné un nombre para reconocer el lote.' : null;
  const hectaresError =
    isNew && !(Number.isFinite(hectares) && hectares > 0) ? 'Cargá las hectáreas del lote.' : null;
  const datesError =
    sowingDate && harvestDate && harvestDate <= sowingDate
      ? 'La cosecha tiene que ser después de la siembra.'
      : null;

  const addCrop = async (lotId: string) => {
    if (!campaign || crop === NO_CROP) return null;
    const outcome = await addLotCropAction(farmId, lotId, {
      campaignId: campaign.id,
      crop,
      sowingDate: sowingDate || null,
      expectedHarvestDate: harvestDate || null,
    });
    return outcome.status === 'ok' ? null : failureCopy(outcome);
  };

  const submit = async () => {
    if (mode.kind === 'crop') {
      const error = await addCrop(mode.lot.id);
      if (!error) onSaved(`Cargaste ${cropLabel(crop as CropType)} en ${mode.lot.name}`);
      return error;
    }

    const created = await createLotAction(farmId, { name, hectares });
    if (created.status !== 'ok') return failureCopy(created);

    const cropError = await addCrop(created.data.id);
    // El lote ya quedó creado: se avisa y se cierra igual, el cultivo se puede cargar después.
    onSaved(
      cropError
        ? `Creaste ${created.data.name}, pero no pudimos cargar el cultivo`
        : `Creaste ${created.data.name}`
    );
    return null;
  };

  return (
    <FormShell
      onClose={onClose}
      title={isNew ? 'Nuevo lote' : `Cultivo en ${mode.lot.name}`}
      description={
        isNew
          ? 'Una parte del campo que se trabaja por separado. Con su cultivo, entra en el avance de labores.'
          : `Lo que se siembra en ${mode.lot.name} (${mode.lot.hectares} ha) en la campaña ${campaign?.name ?? ''}.`
      }
      submitLabel={isNew ? 'Crear lote' : 'Cargar cultivo'}
      pendingLabel="Guardando…"
      validate={() => {
        setTouched(true);
        return !nameError && !hectaresError && !datesError && (isNew || campaign !== null);
      }}
      onSubmit={submit}
    >
      {isNew && (
        <>
          <Field data-invalid={touched && nameError ? true : undefined}>
            <FieldLabel htmlFor="lot-name">Nombre del lote</FieldLabel>
            <Input
              id="lot-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Lote 3 · El Bajo"
              maxLength={LOT_NAME_MAX}
              autoComplete="off"
              aria-invalid={touched && nameError !== null}
              autoFocus
            />
            {touched && nameError && <FieldError>{nameError}</FieldError>}
          </Field>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="lot-hectares">Hectáreas</FieldLabel>
            <NumberInput
              id="lot-hectares"
              name="lot-hectares"
              className="max-w-64"
              min={0}
              value={hectares}
              onValueChange={setHectares}
            />
            {touched && hectaresError && (
              <p className="text-caption text-destructive">{hectaresError}</p>
            )}
          </div>
        </>
      )}

      {campaign ? (
        <>
          <Field>
            <FieldLabel htmlFor="lot-crop">
              Cultivo en la campaña {campaign.name}
              {isNew && ' (opcional)'}
            </FieldLabel>
            <NativeSelect
              id="lot-crop"
              value={crop}
              onChange={(event) => setCrop(event.target.value as CropType | typeof NO_CROP)}
            >
              {isNew && <NativeSelectOption value={NO_CROP}>Todavía no sé</NativeSelectOption>}
              {CROP_OPTIONS.map((option) => (
                <NativeSelectOption key={option} value={option}>
                  {cropLabel(option)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          {crop !== NO_CROP && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="lot-sowing">Siembra (opcional)</FieldLabel>
                <Input
                  id="lot-sowing"
                  type="date"
                  value={sowingDate}
                  onChange={(event) => setSowingDate(event.target.value)}
                />
              </Field>
              <Field data-invalid={touched && datesError ? true : undefined}>
                <FieldLabel htmlFor="lot-harvest">Cosecha prevista (opcional)</FieldLabel>
                <Input
                  id="lot-harvest"
                  type="date"
                  value={harvestDate}
                  onChange={(event) => setHarvestDate(event.target.value)}
                />
                {touched && datesError && <FieldError>{datesError}</FieldError>}
              </Field>
            </div>
          )}
          {crop !== NO_CROP && (
            <FieldDescription>
              Con las fechas, el cultivo aparece en la línea de la campaña y en la próxima cosecha.
            </FieldDescription>
          )}
        </>
      ) : (
        <FieldDescription>
          Creá una campaña para cargar qué se siembra en cada lote.
        </FieldDescription>
      )}
    </FormShell>
  );
}

interface LotDrawerProps extends Omit<LotFormProps, 'mode'> {
  /** `null`: cerrado. */
  mode: LotDrawerMode | null;
}

/** Alta de un lote o de un cultivo en un lote, solo para el productor dueño. */
export default function LotDrawer({ mode, ...props }: LotDrawerProps) {
  // Mientras se cierra, el formulario sigue mostrando el último modo para que la animación no quede vacía.
  const [lastMode, setLastMode] = useState<LotDrawerMode>({ kind: 'new' });
  if (mode && mode !== lastMode) setLastMode(mode);

  return (
    <FormDrawer open={mode !== null} onClose={props.onClose}>
      <LotForm mode={mode ?? lastMode} {...props} />
    </FormDrawer>
  );
}
