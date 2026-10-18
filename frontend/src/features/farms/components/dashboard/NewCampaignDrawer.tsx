'use client';

import { useState } from 'react';
import { createCampaignAction } from '@/core/actions/create-campaign.action';
import type { Campaign } from '@/core/models/farm-dashboard.model';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/components/Field';
import { Input } from '@/ui/components/Input';
import { suggestedCampaign, todayIso } from '../../lib/dashboard-view';
import FormDrawer, { FormShell, failureCopy } from './FormDrawer';

const NAME_FORMAT = /^(\d{4})\/(\d{2})$/;

/** "2026/27": cuatro dígitos, barra y los dos últimos del año siguiente. */
function nameError(name: string): string | null {
  const match = NAME_FORMAT.exec(name.trim());
  if (!match) return 'Escribila como 2026/27.';
  return (Number(match[1]) + 1) % 100 === Number(match[2])
    ? null
    : 'Tienen que ser dos años seguidos, por ejemplo 2026/27.';
}

interface CampaignFormProps {
  farmId: string;
  onClose: () => void;
  onCreated: (campaign: Campaign) => void;
}

function CampaignForm({ farmId, onClose, onCreated }: CampaignFormProps) {
  const suggestion = suggestedCampaign(todayIso());
  const [name, setName] = useState(suggestion.name);
  const [startsOn, setStartsOn] = useState(suggestion.startsOn);
  const [endsOn, setEndsOn] = useState(suggestion.endsOn);
  const [touched, setTouched] = useState(false);

  const nameProblem = nameError(name);
  const datesProblem =
    startsOn && endsOn && endsOn > startsOn ? null : 'El fin tiene que ser después del inicio.';

  const submit = async () => {
    const outcome = await createCampaignAction(farmId, { name, startsOn, endsOn });
    if (outcome.status === 'ok') {
      onCreated(outcome.data);
      return null;
    }
    return failureCopy(outcome);
  };

  return (
    <FormShell
      onClose={onClose}
      title="Nueva campaña"
      description="El período en el que se siembran y cosechan los lotes. El equipo sigue siendo el mismo."
      submitLabel="Crear campaña"
      pendingLabel="Creando…"
      validate={() => {
        setTouched(true);
        return !nameProblem && !datesProblem;
      }}
      onSubmit={submit}
    >
      <Field data-invalid={touched && nameProblem ? true : undefined}>
        <FieldLabel htmlFor="campaign-name">Campaña</FieldLabel>
        <Input
          id="campaign-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="2026/27"
          inputMode="numeric"
          maxLength={7}
          className="max-w-40 font-mono"
          aria-invalid={touched && nameProblem !== null}
          autoFocus
        />
        {touched && nameProblem && <FieldError>{nameProblem}</FieldError>}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={touched && datesProblem ? true : undefined}>
          <FieldLabel htmlFor="campaign-start">Empieza</FieldLabel>
          <Input
            id="campaign-start"
            type="date"
            value={startsOn}
            onChange={(event) => setStartsOn(event.target.value)}
          />
        </Field>
        <Field data-invalid={touched && datesProblem ? true : undefined}>
          <FieldLabel htmlFor="campaign-end">Termina</FieldLabel>
          <Input
            id="campaign-end"
            type="date"
            value={endsOn}
            onChange={(event) => setEndsOn(event.target.value)}
          />
          {touched && datesProblem && <FieldError>{datesProblem}</FieldError>}
        </Field>
      </div>
      <FieldDescription>
        Sugerimos de julio a junio, para que entren la fina y la gruesa. Ajustalo a cómo trabajás.
      </FieldDescription>
    </FormShell>
  );
}

interface NewCampaignDrawerProps extends CampaignFormProps {
  open: boolean;
}

/** Alta de una campaña, solo para el productor dueño. */
export default function NewCampaignDrawer({ open, ...props }: NewCampaignDrawerProps) {
  return (
    <FormDrawer open={open} onClose={props.onClose}>
      <CampaignForm {...props} />
    </FormDrawer>
  );
}
