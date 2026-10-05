'use client';

import { useId } from 'react';
import dynamic from 'next/dynamic';
import {
  ChoiceGroup,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  NativeSelect,
  NativeSelectOption,
  NumberField,
  PhoneInput,
} from '@/ui/components';
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
        // 74px ≈ altura real de un campo con label (ver ui/components/NativeSelect.tsx).
        <div key={i} className="h-[74px] animate-pulse rounded-lg bg-pine/5" />
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
  const baseId = useId();

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, i) => {
        if (field.kind === 'location') {
          return <LocationFields key={`location-${i}`} field={field} values={values} errors={errors} onChange={onChange} />;
        }

        const id = `${baseId}-${field.name}`;
        const error = errors[field.name];
        // El error o la ayuda se vinculan al control con aria-describedby: el lector los lee al enfocar el campo.
        const errorId = `${id}-error`;
        const hintId = `${id}-hint`;
        const hasHint = !!field.hint && field.kind !== 'choice';
        const describedBy = error ? errorId : hasHint ? hintId : undefined;
        const footer = (
          <>
            <FieldError id={errorId}>{error}</FieldError>
            {field.hint && !error && field.kind !== 'choice' && <FieldDescription id={hintId}>{field.hint}</FieldDescription>}
          </>
        );

        switch (field.kind) {
          case 'select':
            return (
              <Field key={field.name} data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
                <NativeSelect
                  id={id}
                  className="w-full"
                  aria-invalid={!!error}
                  aria-describedby={describedBy}
                  value={values[field.name] ?? ''}
                  onChange={(e) => onChange({ [field.name]: e.target.value })}
                >
                  {field.placeholder && <NativeSelectOption value="">{field.placeholder}</NativeSelectOption>}
                  {field.options.map((o) => (
                    <NativeSelectOption key={o.value} value={o.value}>
                      {o.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {footer}
              </Field>
            );
          case 'password':
            return (
              <PasswordField
                key={field.name}
                field={field}
                value={values[field.name] ?? ''}
                error={error}
                onChange={(value) => onChange({ [field.name]: value })}
              />
            );
          case 'email':
            return (
              <Field key={field.name} data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
                <Input
                  id={id}
                  type="email"
                  inputMode="email"
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  maxLength={254}
                  disabled={field.readOnly}
                  aria-invalid={!!error}
                  aria-describedby={describedBy}
                  value={values[field.name] ?? ''}
                  onChange={(e) => onChange({ [field.name]: e.target.value })}
                />
                {footer}
              </Field>
            );
          case 'counter': {
            const parsed = Number(values[field.name]);
            return (
              <NumberField
                key={field.name}
                name={field.name}
                className="w-full max-w-64"
                minValue={field.min}
                maxValue={field.max}
                isInvalid={!!error}
                value={values[field.name] === '' || !Number.isFinite(parsed) ? NaN : parsed}
                onChange={(n) => onChange({ [field.name]: Number.isNaN(n) ? '' : String(n) })}
              >
                <NumberField.Label>{field.label}</NumberField.Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input />
                  <NumberField.IncrementButton />
                </NumberField.Group>
                {footer}
              </NumberField>
            );
          }
          case 'choice':
            return (
              <ChoiceGroup
                key={field.name}
                label={field.label}
                error={error}
                hint={field.multiple ? 'Podés elegir más de uno.' : field.hint}
                multiple={field.multiple}
                options={field.options}
                value={parseMulti(values[field.name])}
                onValueChange={(selected) => onChange({ [field.name]: joinMulti(selected) })}
              />
            );
          case 'text':
            if (field.format === 'phone') {
              return (
                <Field key={field.name} data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
                  <PhoneInput
                    id={id}
                    autoComplete={field.autoComplete}
                    aria-invalid={!!error}
                    aria-describedby={describedBy}
                    value={values[field.name] || undefined}
                    onChange={(value) => onChange({ [field.name]: value ?? '' })}
                  />
                  {footer}
                </Field>
              );
            }
          // eslint-disable-next-line no-fallthrough
          default:
            return (
              <Field key={field.name} data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
                <Input
                  id={id}
                  type={field.kind === 'number' ? 'number' : 'text'}
                  inputMode={field.inputMode ?? (field.kind === 'number' ? 'numeric' : undefined)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  min={field.min}
                  max={field.max}
                  autoComplete={field.autoComplete}
                  aria-invalid={!!error}
                  aria-describedby={describedBy}
                  value={values[field.name] ?? ''}
                  onChange={(e) => onChange({ [field.name]: e.target.value })}
                />
                {footer}
              </Field>
            );
        }
      })}
    </div>
  );
}
