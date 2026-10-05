'use client';

import * as React from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import PhoneInputPrimitive, { getCountryCallingCode, type Country } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import es from 'react-phone-number-input/locale/es.json';
import { cn } from '@/shared/utils/cn';
import { Input } from './Input';

// Teléfono con código de país y número agrupado ("+54 9 351 226 4907"). Combina `react-phone-number-input`
// (libphonenumber: formato por país, valor en E.164) con el `Input` oficial de shadcn. Sin el CSS de la librería.
// AgroNexo opera solo en Sudamérica.
const SOUTH_AMERICA: Country[] = ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'];

interface CountrySelectProps {
  value?: Country;
  onChange: (country?: Country) => void;
  options: { value?: Country; label: string; divider?: boolean }[];
  iconComponent: React.ElementType;
  disabled?: boolean;
  readOnly?: boolean;
}

function CountrySelect({ value, onChange, options, iconComponent: Icon, disabled, readOnly }: CountrySelectProps) {
  return (
    <div
      data-slot="phone-country"
      className={cn(
        'relative flex h-8 w-[4.5rem] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-input bg-transparent transition-colors',
        'has-[select:focus-visible]:border-ring has-[select:focus-visible]:ring-3 has-[select:focus-visible]:ring-ring/50',
        (disabled || readOnly) && 'opacity-50',
      )}
    >
      {/* La librería dimensiona la bandera con su CSS (que no importamos): sin este contenedor el SVG queda sin tamaño. */}
      {value && (
        <span
          aria-hidden
          className="block h-4 w-6 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-pine/20 [&_.PhoneInputCountryIcon]:h-full [&_.PhoneInputCountryIcon]:w-full [&_.PhoneInputCountryIconImg]:block [&_.PhoneInputCountryIconImg]:h-full [&_.PhoneInputCountryIconImg]:w-full"
        >
          <Icon country={value} label={es[value]} aspectRatio={1.5} />
        </span>
      )}
      <CaretDownIcon className="size-4 text-muted-foreground" aria-hidden />
      <select
        aria-label="País del teléfono"
        value={value ?? ''}
        disabled={disabled || readOnly}
        onChange={(e) => onChange((e.target.value || undefined) as Country | undefined)}
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {options
          .filter((o) => o.value)
          .map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} +{getCountryCallingCode(o.value as Country)}
            </option>
          ))}
      </select>
    </div>
  );
}

interface PhoneInputProps {
  /** Número en formato E.164 (ej. +5493512264907) o vacío. */
  value?: string;
  onChange: (value?: string) => void;
  id?: string;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: Country;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

function PhoneInput({ className, defaultCountry = 'AR', value, onChange, ...props }: PhoneInputProps) {
  return (
    <PhoneInputPrimitive
      className={cn('flex w-full items-center gap-2', className)}
      international
      withCountryCallingCode
      countryCallingCodeEditable={false}
      defaultCountry={defaultCountry}
      countries={SOUTH_AMERICA}
      labels={es}
      flags={flags}
      inputComponent={Input}
      countrySelectComponent={CountrySelect}
      value={value}
      onChange={(next) => onChange(next)}
      {...props}
    />
  );
}

export { PhoneInput };
