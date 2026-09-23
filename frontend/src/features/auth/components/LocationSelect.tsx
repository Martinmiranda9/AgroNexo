'use client';

import { useState, useEffect, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface LocationValue {
  country: string;    // country name
  countryCode: string;
  province: string;   // state/province name
  provinceCode: string;
  city: string;
}

interface LocationSelectProps {
  defaultCountryCode?: string; // 'AR' por defecto
  onChange?: (value: LocationValue) => void;
  errors?: Partial<Record<'country' | 'province' | 'city', string>>;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Selects en cascada País → Provincia → Ciudad.
 * Usa la librería country-state-city (datos estáticos, sin API key).
 * Por defecto arranca con Argentina seleccionado.
 */
export function LocationSelect({
  defaultCountryCode = 'AR',
  onChange,
  errors,
}: LocationSelectProps) {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [provinceCode, setProvinceCode] = useState('');
  const [city, setCity] = useState('');

  // Listas derivadas de la selección actual
  const countries = useMemo(() => Country.getAllCountries(), []);
  const provinces = useMemo(
    () => (countryCode ? State.getStatesOfCountry(countryCode) : []),
    [countryCode],
  );
  const cities = useMemo(
    () => (countryCode && provinceCode ? City.getCitiesOfState(countryCode, provinceCode) : []),
    [countryCode, provinceCode],
  );

  // Notificar al padre cuando cambia cualquier valor
  useEffect(() => {
    const countryObj = countries.find((c) => c.isoCode === countryCode);
    const provinceObj = provinces.find((s) => s.isoCode === provinceCode);
    onChange?.({
      country: countryObj?.name ?? '',
      countryCode,
      province: provinceObj?.name ?? '',
      provinceCode,
      city,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, provinceCode, city]);

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    setProvinceCode('');
    setCity('');
  };

  const handleProvinceChange = (code: string) => {
    setProvinceCode(code);
    setCity('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* País */}
      <div>
        <label htmlFor="loc-country" className="mb-1.5 block text-sm font-medium text-dark">
          País
        </label>
        <Select value={countryCode} onValueChange={handleCountryChange}>
          <SelectTrigger id="loc-country" error={errors?.country}>
            <SelectValue placeholder="Seleccioná un país" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.isoCode} value={c.isoCode}>
                {c.flag} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.country && <p className="mt-1 text-xs text-danger">{errors.country}</p>}
      </div>

      {/* Provincia / Estado */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="loc-province" className="mb-1.5 block text-sm font-medium text-dark">
            Provincia
            {!provinceCode && <span className="ml-1 font-normal text-neutral-warm/80">(Opcional)</span>}
          </label>
          <Select
            value={provinceCode}
            onValueChange={handleProvinceChange}
            disabled={provinces.length === 0}
          >
            <SelectTrigger id="loc-province" error={errors?.province}>
              <SelectValue placeholder={provinces.length === 0 ? 'Sin opciones' : 'Seleccioná'} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((s) => (
                <SelectItem key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.province && <p className="mt-1 text-xs text-danger">{errors.province}</p>}
        </div>

        {/* Ciudad */}
        <div>
          <label htmlFor="loc-city" className="mb-1.5 block text-sm font-medium text-dark">
            Ciudad
            <span className="ml-1 font-normal text-neutral-warm/80">(Opcional)</span>
          </label>
          <Select
            value={city}
            onValueChange={setCity}
            disabled={!provinceCode || cities.length === 0}
          >
            <SelectTrigger id="loc-city" error={errors?.city}>
              <SelectValue placeholder={!provinceCode ? 'Elegí provincia' : cities.length === 0 ? 'Sin ciudades' : 'Seleccioná'} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.city && <p className="mt-1 text-xs text-danger">{errors.city}</p>}
        </div>
      </div>
    </div>
  );
}
