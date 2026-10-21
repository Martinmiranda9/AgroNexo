'use client';

import { useMemo, useState } from 'react';
import { addLotCropAction } from '@/core/actions/add-lot-crop.action';
import { createLotAction } from '@/core/actions/create-lot.action';
import {
  LOT_NAME_MAX,
  type Campaign,
  type CropType,
  type Lot,
} from '@/core/models/farm-dashboard.model';
import type { GeoPoint } from '@/core/models/farm.model';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import { Input } from '@/ui/components/Input';
import { NativeSelect, NativeSelectOption } from '@/ui/components/NativeSelect';
import { NumberInput } from '@/ui/components/NumberInput';
import { toast } from '@/ui/components/Toaster';
import { CROP_OPTIONS, cropLabel, numberLabel } from '../../lib/dashboard-view';
import {
  findOverlap,
  hasCrossingEdges,
  isOutsidePerimeter,
  openRing,
} from '../../lib/lot-geometry';
import CoordinatesField from '../map/CoordinatesField';
import DrawingMapPanel from '../map/DrawingMapPanel';
import FormDrawer, { FormShell, failureCopy } from './FormDrawer';

const NO_CROP = '';

/** `new`: lote nuevo (con su cultivo opcional). `crop`: cultivo para un lote que ya existe. */
export type LotDrawerMode = { kind: 'new' } | { kind: 'crop'; lot: Lot };

interface LotFormProps {
  farmId: string;
  mode: LotDrawerMode;
  /** Campaña elegida en el tablero: el cultivo se carga ahí. Sin campaña, el lote va sin cultivo. */
  campaign: Campaign | null;
  /** Perímetro del campo (anillo cerrado), de referencia en el mapa. */
  perimeter: GeoPoint[];
  /** Lotes del campo: los dibujados se ven en el mapa para no pisarlos. */
  lots: Lot[];
  /** Hectáreas declaradas del campo: si los lotes las pasan, se avisa (no se bloquea). */
  farmHectares: number;
  /** Solo el productor dueño carga cultivos; el agrónomo crea el lote sin cultivo. */
  canManageCrops: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function LotForm({
  farmId,
  mode,
  campaign,
  perimeter,
  lots,
  farmHectares,
  canManageCrops,
  onClose,
  onSaved,
}: LotFormProps) {
  const isNew = mode.kind === 'new';
  const [name, setName] = useState('');
  const [corners, setCorners] = useState<GeoPoint[]>([]);
  const [focus, setFocus] = useState<GeoPoint | null>(null);
  const [hectares, setHectares] = useState<number>(NaN);
  const [crop, setCrop] = useState<CropType | typeof NO_CROP>(isNew ? NO_CROP : 'Soybean');
  const [sowingDate, setSowingDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [touched, setTouched] = useState(false);

  const farmPerimeter = useMemo(() => openRing(perimeter), [perimeter]);
  const drawnLots = useMemo(
    () =>
      lots
        .filter((lot) => lot.boundaryCoordinates.length > 0)
        .map((lot) => ({ id: lot.id, label: lot.name, points: openRing(lot.boundaryCoordinates) })),
    [lots]
  );

  const showCrop = campaign !== null && canManageCrops;

  const nameError = isNew && !name.trim() ? 'Poné un nombre para reconocer el lote.' : null;
  const hectaresError =
    isNew && !(Number.isFinite(hectares) && hectares > 0) ? 'Cargá las hectáreas del lote.' : null;
  // El dibujo es opcional; lo único que impide guardar es dejarlo a medias o con el borde cruzado.
  const shapeError =
    corners.length > 0 && corners.length < 3
      ? 'Terminá el dibujo (al menos 3 esquinas) o borralo para guardar el lote sin ubicar.'
      : hasCrossingEdges(corners)
        ? 'El borde se cruza consigo mismo. Arrastrá las esquinas para que no se crucen.'
        : null;

  // Avisos que no impiden guardar.
  const overlapped = findOverlap(corners, drawnLots);
  const lotsTotal =
    lots.reduce((sum, lot) => sum + lot.hectares, 0) + (Number.isFinite(hectares) ? hectares : 0);
  const warnings = [
    isOutsidePerimeter(corners, farmPerimeter) &&
      'Una parte del dibujo queda afuera del perímetro del campo.',
    overlapped && `El dibujo se encima con ${overlapped.label}.`,
    isNew &&
      farmHectares > 0 &&
      Number.isFinite(hectares) &&
      lotsTotal > farmHectares &&
      `Con este lote, los lotes suman ${numberLabel(lotsTotal)} ha y el campo figura con ${numberLabel(farmHectares)} ha.`,
  ].filter((warning): warning is string => typeof warning === 'string');

  const datesError =
    sowingDate && harvestDate && harvestDate <= sowingDate
      ? 'La cosecha tiene que ser después de la siembra.'
      : null;

  const addCrop = async (lotId: string) => {
    if (!campaign || !canManageCrops || crop === NO_CROP) return null;
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
      if (error) toast.error('No pudimos cargar el cultivo', { description: error });
      else onSaved(`Cargaste ${cropLabel(crop as CropType)} en ${mode.lot.name}`);
      return error;
    }

    const created = await createLotAction(
      farmId,
      corners.length >= 3 ? { name, hectares, boundaryCoordinates: corners } : { name, hectares }
    );
    if (created.status !== 'ok') {
      const error = failureCopy(created);
      toast.error('No pudimos guardar el lote', { description: error });
      return error;
    }

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
          ? 'Una parte del campo que se trabaja por separado. Cargá sus hectáreas y, si querés, ubicalo en el mapa.'
          : `Lo que se siembra en ${mode.lot.name} (${mode.lot.hectares} ha) en la campaña ${campaign?.name ?? ''}.`
      }
      submitLabel={isNew ? 'Crear lote' : 'Cargar cultivo'}
      pendingLabel="Guardando…"
      validate={() => {
        setTouched(true);
        return (
          !nameError && !hectaresError && !shapeError && !datesError && (isNew || campaign !== null)
        );
      }}
      onSubmit={submit}
      aside={
        isNew && (
          <DrawingMapPanel
            label="Ubicación en el mapa (opcional)"
            perimeter={farmPerimeter}
            shapes={drawnLots}
            value={corners}
            onChange={setCorners}
            focus={focus}
            error={touched ? shapeError : null}
            warnings={warnings}
            aria-label="Mapa para dibujar el lote"
          />
        )
      }
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
            {touched && hectaresError ? (
              <p className="text-caption text-destructive">{hectaresError}</p>
            ) : (
              <FieldDescription>
                Las que trabajás en el lote. El dibujo no las cambia.
              </FieldDescription>
            )}
          </div>

          <CoordinatesField onGo={setFocus} />
        </>
      )}

      {showCrop ? (
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
        canManageCrops && (
          <FieldDescription>
            Creá una campaña para cargar qué se siembra en cada lote.
          </FieldDescription>
        )
      )}
    </FormShell>
  );
}

interface LotDrawerProps extends Omit<LotFormProps, 'mode'> {
  /** `null`: cerrado. */
  mode: LotDrawerMode | null;
}

/**
 * Alta de un lote (dibujado en el mapa o con sus hectáreas) o de un cultivo en un lote. El lote lo crean el productor
 * dueño o el agrónomo del equipo; el cultivo, solo el productor.
 */
export default function LotDrawer({ mode, ...props }: LotDrawerProps) {
  // Mientras se cierra, el formulario sigue mostrando el último modo para que la animación no quede vacía.
  const [lastMode, setLastMode] = useState<LotDrawerMode>({ kind: 'new' });
  if (mode && mode !== lastMode) setLastMode(mode);

  return (
    <FormDrawer
      open={mode !== null}
      onClose={props.onClose}
      size={(mode ?? lastMode).kind === 'new' ? 'full' : 'panel'}
    >
      <LotForm mode={mode ?? lastMode} {...props} />
    </FormDrawer>
  );
}
