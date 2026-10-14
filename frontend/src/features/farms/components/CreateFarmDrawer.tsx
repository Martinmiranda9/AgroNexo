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
} from '@/core/models/farm.model';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/components/Drawer';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import { Input } from '@/ui/components/Input';
import { NumberField } from '@/ui/components/NumberField';
import { Textarea } from '@/ui/components/Textarea';
import FarmDrawer, {
  DRAWER_BODY,
  DRAWER_FOOTER,
  DRAWER_HEADER,
  FarmDrawerCloseButton,
} from './FarmDrawer';

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
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const trimmed = name.trim();
  const nameError =
    trimmed.length < FARM_NAME_MIN ? 'Poné un nombre para reconocer el campo.' : null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (nameError) return;

    setPending(true);
    setFailure(null);
    const outcome = await createFarmAction({
      name: trimmed,
      description,
      totalHectares: Number.isFinite(hectares) ? hectares : 0,
    });
    setPending(false);

    if (outcome.status === 'created') {
      onCreated(outcome.farm);
      return;
    }
    setFailure(outcome.status);
  };

  const showNameError = touched && nameError !== null;

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className={DRAWER_HEADER}>
        <DrawerTitle className="text-heading-sm tracking-heading text-pine pr-10">
          Nuevo campo
        </DrawerTitle>
        <DrawerDescription className="text-body-sm text-dark">
          Es el espacio donde vas a sumar a tus profesionales. Le asignamos un ID para que lo
          reconozcan.
        </DrawerDescription>
        <FarmDrawerCloseButton />
      </DrawerHeader>

      <div className={DRAWER_BODY}>
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

        <NumberField
          name="farm-hectares"
          className="w-full max-w-64"
          minValue={0}
          maxValue={FARM_HECTARES_MAX}
          value={hectares}
          onChange={(value) => setHectares(value)}
          isDisabled={pending}
        >
          <NumberField.Label>Hectáreas (opcional)</NumberField.Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>

        {failure && (
          <Alert variant="destructive" role="alert">
            <MdErrorOutline aria-hidden />
            <AlertDescription>{FAILURE_COPY[failure]}</AlertDescription>
          </Alert>
        )}
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

/** Alta de un campo: nombre, descripción opcional y hectáreas opcionales. El ID lo asigna el backend. */
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
    <FarmDrawer open={open} onClose={onClose}>
      <CreateFarmForm
        key={formKey}
        onClose={onClose}
        onCreated={onCreated}
        submitLabel={submitLabel}
      />
    </FarmDrawer>
  );
}
