'use client';

import { useState, type FormEvent } from 'react';
import { MdArrowForward, MdErrorOutline } from 'react-icons/md';
import { createFarmAction } from '@/core/actions/create-farm.action';
import {
  FARM_DESCRIPTION_MAX,
  FARM_HECTARES_MAX,
  FARM_NAME_MAX,
  FARM_NAME_MIN,
  type CreateFarmResult,
  type CreatedFarm,
  type GeoPoint,
} from '@/core/models/farm.model';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/components/Drawer';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import { Input } from '@/ui/components/Input';
import { NumberInput } from '@/ui/components/NumberInput';
import { Textarea } from '@/ui/components/Textarea';
import { toast } from '@/ui/components/Toaster';
import { hasCrossingEdges } from '../lib/lot-geometry';
import FarmDrawer, {
  DRAWER_FOOTER,
  DRAWER_HEADER,
  DRAWER_SPLIT_ASIDE,
  DRAWER_SPLIT_BODY,
  DRAWER_SPLIT_FIELDS,
  FarmDrawerCloseButton,
} from './FarmDrawer';
import CoordinatesField from './map/CoordinatesField';
import DrawingMapPanel from './map/DrawingMapPanel';

type Failure = Exclude<CreateFarmResult['status'], 'created'>;

const FAILURE_COPY: Record<Failure, string> = {
  invalid: 'Revisá el nombre y la descripción y probá de nuevo.',
  unauthorized: 'Tu sesión venció. Volvé a ingresar para crear el campo.',
  forbidden: 'Solo una cuenta de productor puede crear campos.',
  unavailable: 'No pudimos crear el campo. Probá de nuevo en unos minutos.',
};

interface CreateFarmDrawerProps {
  open: boolean;
  onClose: () => void;
  /** El campo quedó creado: quien abre el panel decide qué sigue (invitar, sumar a alguien). */
  onCreated: (farm: CreatedFarm) => void;
  /** Texto del botón de envío; cambia cuando crear el campo también suma a un profesional. */
  submitLabel?: string;
}

function CreateFarmForm({
  onClose,
  onCreated,
  submitLabel,
}: Omit<CreateFarmDrawerProps, 'open'> & { submitLabel: string }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hectares, setHectares] = useState<number>(NaN);
  const [perimeter, setPerimeter] = useState<GeoPoint[]>([]);
  const [focus, setFocus] = useState<GeoPoint | null>(null);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const trimmed = name.trim();
  const nameError =
    trimmed.length < FARM_NAME_MIN ? 'Poné un nombre para reconocer el campo.' : null;
  // El perímetro es opcional, pero si se empezó a dibujar tiene que quedar bien.
  const hasPerimeter = perimeter.length >= 3;
  const perimeterError =
    perimeter.length > 0 && perimeter.length < 3
      ? 'El perímetro necesita al menos 3 esquinas, o borrá el dibujo.'
      : hasCrossingEdges(perimeter)
        ? 'El borde se cruza consigo mismo. Arrastrá las esquinas para que no se crucen.'
        : null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (nameError || perimeterError) return;

    setPending(true);
    setFailure(null);
    const outcome = await createFarmAction({
      name: trimmed,
      description,
      totalHectares: Number.isFinite(hectares) ? hectares : 0,
      locationCoordinates: hasPerimeter ? perimeter : undefined,
    });
    setPending(false);

    if (outcome.status === 'created') {
      onCreated(outcome.farm);
      return;
    }
    setFailure(outcome.status);
    toast.error('No pudimos crear el campo', { description: FAILURE_COPY[outcome.status] });
  };

  const showNameError = touched && nameError !== null;

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className={DRAWER_HEADER}>
        <DrawerTitle className="pr-10">Nuevo campo</DrawerTitle>
        <DrawerDescription>
          Es el espacio donde vas a sumar a tus profesionales. Si querés, dibujá su perímetro para
          ubicarlo en el mapa.
        </DrawerDescription>
        <FarmDrawerCloseButton />
      </DrawerHeader>

      <div className={DRAWER_SPLIT_BODY}>
        <div className={DRAWER_SPLIT_FIELDS}>
          <Field data-invalid={showNameError ? true : undefined}>
            <FieldLabel htmlFor="farm-name">Nombre del campo</FieldLabel>
            <Input
              id="farm-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="La Esperanza"
              maxLength={FARM_NAME_MAX}
              autoComplete="off"
              aria-invalid={showNameError}
              aria-describedby={showNameError ? 'farm-name-error' : undefined}
              disabled={pending}
              autoFocus
            />
            {showNameError && <FieldError id="farm-name-error">{nameError}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="farm-description">Descripción (opcional)</FieldLabel>
            <Textarea
              id="farm-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Campo de 350 ha en Berrotarán. Soja y maíz de primera."
              maxLength={FARM_DESCRIPTION_MAX}
              rows={4}
              aria-describedby="farm-description-hint"
              disabled={pending}
            />
            <FieldDescription id="farm-description-hint">
              Lo que el equipo tiene que saber del campo: zona, cultivos, cómo se trabaja.
            </FieldDescription>
          </Field>

          <CoordinatesField label="Ubicación del campo (opcional)" onGo={setFocus} />

          <Field className="max-w-64">
            <FieldLabel htmlFor="farm-hectares">Hectáreas (opcional)</FieldLabel>
            <NumberInput
              id="farm-hectares"
              name="farm-hectares"
              min={0}
              max={FARM_HECTARES_MAX}
              value={hectares}
              onValueChange={setHectares}
              disabled={pending}
            />
            <FieldDescription>
              Las del campo, como figuran para vos. El dibujo no las cambia.
            </FieldDescription>
          </Field>

          {failure && (
            <Alert variant="destructive" role="alert">
              <MdErrorOutline aria-hidden />
              <AlertDescription>{FAILURE_COPY[failure]}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className={DRAWER_SPLIT_ASIDE}>
          <DrawingMapPanel
            label="Perímetro del campo (opcional)"
            value={perimeter}
            onChange={pending ? undefined : setPerimeter}
            focus={focus}
            error={touched ? perimeterError : null}
            aria-label="Mapa para dibujar el perímetro del campo"
          />
        </div>
      </div>

      <DrawerFooter className={DRAWER_FOOTER}>
        <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" loading={pending} loadingText="Creando campo…">
          {submitLabel}
          <MdArrowForward data-icon="inline-end" size={16} aria-hidden />
        </Button>
      </DrawerFooter>
    </form>
  );
}

/**
 * Alta de un campo en pantalla completa: nombre, descripción, y hectáreas o el perímetro dibujado en el mapa (todo
 * opcional menos el nombre). El ID lo asigna el backend.
 */
export default function CreateFarmDrawer({
  open,
  onClose,
  onCreated,
  submitLabel = 'Crear campo',
}: CreateFarmDrawerProps) {
  // Cada apertura monta un formulario nuevo (arranca vacío); al cerrar sigue montado para que la animación no quede vacía.
  const [formKey, setFormKey] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  return (
    <FarmDrawer open={open} onClose={onClose} size="full">
      <CreateFarmForm
        key={formKey}
        onClose={onClose}
        onCreated={onCreated}
        submitLabel={submitLabel}
      />
    </FarmDrawer>
  );
}
