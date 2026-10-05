'use client';

import { useId, useMemo } from 'react';
import { motion } from 'motion/react';
import { City, Country, State } from 'country-state-city';
import { Field, FieldError, FieldLabel, Input, NativeSelect, NativeSelectOption } from '@/ui/components';
import type { FormValues, LocationField } from '../config/types';
import type { FieldErrors } from '../lib/validation';

interface LocationFieldsProps {
  field: LocationField;
  values: FormValues;
  errors: FieldErrors;
  onChange: (patch: FormValues) => void;
}

// Misma curva que el resto de las transiciones del wizard (RegistrationWizard.tsx).
const EASE = [0.16, 1, 0.3, 1] as const;

// AgroNexo opera solo en Sudamérica (AR, BO, BR, CL, CO, EC, GY, PY, PE, SR, UY, VE).
const SOUTH_AMERICA = ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'];

/**
 * Selects en cascada País → Provincia → Ciudad (datos estáticos de country-state-city).
 * `StepFields.tsx` ya carga este componente con `next/dynamic` (code-split + skeleton propio:
 * el paquete pesa ~8MB de datos), así que acá se consumen los datos de forma directa — ya están
 * disponibles apenas el componente monta. El fade-in es solo para que el reemplazo del skeleton
 * por los campos reales no se sienta como un salto brusco.
 */
export default function LocationFields({ field, values, errors, onChange }: LocationFieldsProps) {
  const { countryCode, provinceCode } = values;
  const countryId = useId();
  const provinceId = useId();
  const cityId = useId();

  const countries = useMemo(
    () =>
      SOUTH_AMERICA.flatMap((code) => {
        const c = Country.getCountryByCode(code);
        return c ? [{ value: c.isoCode, label: c.name }] : [];
      }).sort((a, b) => a.label.localeCompare(b.label, 'es')),
    [],
  );
  const provinces = useMemo(
    () => State.getStatesOfCountry(countryCode).map((s) => ({ value: s.isoCode, label: s.name })),
    [countryCode],
  );
  const cities = useMemo(
    () => (provinceCode ? City.getCitiesOfState(countryCode, provinceCode).map((c) => ({ value: c.name, label: c.name })) : []),
    [countryCode, provinceCode],
  );

  const labelOf = (list: { value: string; label: string }[], code: string) => list.find((o) => o.value === code)?.label ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="flex flex-col gap-4"
    >
      {field.levels.includes('country') && (
        <Field data-invalid={errors.country ? true : undefined}>
          <FieldLabel htmlFor={countryId}>País</FieldLabel>
          <NativeSelect
            id={countryId}
            className="w-full"
            aria-invalid={!!errors.country}
            value={countryCode}
            onChange={(e) => {
              const code = e.target.value;
              onChange({ countryCode: code, country: labelOf(countries, code), provinceCode: '', province: '', city: '' });
            }}
          >
            <NativeSelectOption value="">Elegí un país</NativeSelectOption>
            {countries.map((o) => (
              <NativeSelectOption key={o.value} value={o.value}>
                {o.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{errors.country}</FieldError>
        </Field>
      )}

      {field.levels.includes('province') && (
        <Field data-invalid={errors.province ? true : undefined}>
          <FieldLabel htmlFor={provinceId}>Provincia / Región</FieldLabel>
          <NativeSelect
            id={provinceId}
            className="w-full"
            aria-invalid={!!errors.province}
            disabled={!countryCode || provinces.length === 0}
            value={provinceCode}
            onChange={(e) => {
              const code = e.target.value;
              onChange({ provinceCode: code, province: labelOf(provinces, code), city: '' });
            }}
          >
            <NativeSelectOption value="">Elegí una provincia</NativeSelectOption>
            {provinces.map((o) => (
              <NativeSelectOption key={o.value} value={o.value}>
                {o.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{errors.province}</FieldError>
        </Field>
      )}

      {field.levels.includes('city') && (
        <Field>
          <FieldLabel htmlFor={cityId}>Ciudad / Localidad (opcional)</FieldLabel>
          {cities.length > 0 || !provinceCode ? (
            <NativeSelect
              id={cityId}
              className="w-full"
              disabled={!provinceCode}
              value={values.city}
              onChange={(e) => onChange({ city: e.target.value })}
            >
              <NativeSelectOption value="">Elegí una ciudad</NativeSelectOption>
              {cities.map((o) => (
                <NativeSelectOption key={o.value} value={o.value}>
                  {o.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          ) : (
            <Input
              id={cityId}
              placeholder="Escribí tu localidad"
              value={values.city}
              maxLength={100}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          )}
        </Field>
      )}
    </motion.div>
  );
}
