'use client';

import dynamic from 'next/dynamic';
import { ChoiceGroup, Input, Select } from '@/ui/components';
import PasswordField from './PasswordField';
import type { FieldDef, FormValues } from '../config/types';
import { joinMulti, parseMulti } from '../lib/values';
import type { FieldErrors } from '../lib/validation';

// country-state-city pesa bastante: se carga solo en los pasos que lo usan.
// El skeleton reserva 3 filas (el máximo: país + provincia + ciudad) para que al llegar los
// datos reales no haya salto de layout, solo el fade-in que hace LocationFields al montar.
const LocationFields = dynamic(() => import('./LocationFields'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        // 74px ≈ altura real de un Select con label (ver ui/components/Select.tsx).
        <div key={i} className="h-[74px] animate-pulse rounded-xl bg-pine/5" />
      ))}
    </div>
  ),
});

interface StepFieldsProps {
  fields: FieldDef[];
  values: FormValues;
  errors: FieldErrors;
  onChange: (patch: FormValues) => void;
}

/** Renderiza los campos de un paso a partir de su definición. */
export default function StepFields({ fields, values, errors, onChange }: StepFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, i) => {
        if (field.kind === 'location') {
          return <LocationFields key={`location-${i}`} field={field} values={values} errors={errors} onChange={onChange} />;
        }

        const common = { label: field.label, error: errors[field.name] };

        switch (field.kind) {
          case 'select':
            return (
              <Select
                key={field.name}
                {...common}
                hint={field.hint}
                placeholder={field.placeholder}
                options={field.options}
                value={values[field.name]}
                onValueChange={(value) => onChange({ [field.name]: value })}
              />
            );
          case 'password':
            return (
              <PasswordField
                key={field.name}
                field={field}
                value={values[field.name] ?? ''}
                error={errors[field.name]}
                onChange={(value) => onChange({ [field.name]: value })}
              />
            );
          case 'email':
            return (
              <Input
                key={field.name}
                {...common}
                hint={field.hint}
                className="h-12"
                type="email"
                inputMode="email"
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                maxLength={254}
                disabled={field.readOnly}
                value={values[field.name] ?? ''}
                onChange={(e) => onChange({ [field.name]: e.target.value })}
              />
            );
          case 'choice':
            return (
              <ChoiceGroup
                key={field.name}
                {...common}
                hint={field.multiple ? 'Podés elegir más de uno.' : field.hint}
                multiple={field.multiple}
                options={field.options}
                value={parseMulti(values[field.name])}
                onValueChange={(selected) => onChange({ [field.name]: joinMulti(selected) })}
              />
            );
          default:
            return (
              <Input
                key={field.name}
                {...common}
                hint={field.hint}
                className="h-12"
                type={field.kind === 'number' ? 'number' : 'text'}
                inputMode={field.inputMode ?? (field.kind === 'number' ? 'numeric' : undefined)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                min={field.min}
                max={field.max}
                autoComplete={field.autoComplete}
                value={values[field.name] ?? ''}
                onChange={(e) => onChange({ [field.name]: e.target.value })}
              />
            );
        }
      })}
    </div>
  );
}
