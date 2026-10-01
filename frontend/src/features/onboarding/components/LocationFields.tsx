'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { City, Country, State } from 'country-state-city';
import { Input, Select } from '@/ui/components';
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

/**
 * Selects en cascada País → Provincia → Ciudad (datos estáticos de country-state-city).
 * `StepFields.tsx` ya carga este componente con `next/dynamic` (code-split + skeleton propio:
 * el paquete pesa ~8MB de datos), así que acá se consumen los datos de forma directa — ya están
 * disponibles apenas el componente monta. El fade-in es solo para que el reemplazo del skeleton
 * por los campos reales no se sienta como un salto brusco.
 */
export default function LocationFields({ field, values, errors, onChange }: LocationFieldsProps) {
  const { countryCode, provinceCode } = values;

  const countries = useMemo(() => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })), []);
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
        <Select
          label="País"
          placeholder="Elegí un país"
          value={countryCode}
          options={countries}
          error={errors.country}
          onValueChange={(code) =>
            onChange({ countryCode: code, country: labelOf(countries, code), provinceCode: '', province: '', city: '' })
          }
        />
      )}

      {field.levels.includes('province') && (
        <Select
          label="Provincia / Región"
          placeholder="Elegí una provincia"
          value={provinceCode}
          options={provinces}
          error={errors.province}
          disabled={!countryCode || provinces.length === 0}
          onValueChange={(code) => onChange({ provinceCode: code, province: labelOf(provinces, code), city: '' })}
        />
      )}

      {field.levels.includes('city') &&
        (cities.length > 0 || !provinceCode ? (
          <Select
            label="Ciudad / Localidad"
            placeholder="Elegí una ciudad"
            value={values.city}
            options={cities}
            disabled={!provinceCode}
            onValueChange={(city) => onChange({ city })}
          />
        ) : (
          <Input
            label="Ciudad / Localidad"
            className="h-12"
            placeholder="Escribí tu localidad"
            value={values.city}
            maxLength={100}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        ))}
    </motion.div>
  );
}
