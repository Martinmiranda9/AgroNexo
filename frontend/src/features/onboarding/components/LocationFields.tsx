'use client';

import { useMemo } from 'react';
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

/** Selects en cascada País → Provincia → Ciudad (datos estáticos de country-state-city). */
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
    <>
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
    </>
  );
}
