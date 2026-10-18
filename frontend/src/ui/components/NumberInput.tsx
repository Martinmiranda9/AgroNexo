'use client';

import * as React from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { formFieldBase, formFieldSingleLine } from './_shared';

/*
 * Cashmere NumberInput (registro `cashmere/number-input-base`): campo numérico con flechas a la derecha.
 * AgroNexo: acepta vacío (`NaN`) para los campos opcionales, y las flechas son íconos Material.
 */
export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'value'
> {
  /** `NaN` = campo vacío. */
  value?: number;
  onValueChange?: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

const stepButton = cn(
  'flex h-3.5 w-6 items-center justify-center rounded-md',
  'text-muted-foreground transition-colors duration-150',
  'hover:bg-accent hover:text-foreground',
  'focus:ring-ring/40 focus:ring-1 focus:outline-none'
);

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value = NaN, onValueChange, step = 1, min, max, disabled, ...props }, ref) => {
    const clamp = (n: number) => {
      let next = n;
      if (min !== undefined) next = Math.max(next, min);
      if (max !== undefined) next = Math.min(next, max);
      return next;
    };
    const base = Number.isNaN(value) ? (min ?? 0) : value;
    const increment = () => onValueChange?.(clamp(Number.isNaN(value) ? base : value + step));
    const decrement = () => onValueChange?.(clamp(Number.isNaN(value) ? base : value - step));

    return (
      <div className="relative" data-slot="number-input">
        <input
          ref={ref}
          type="number"
          inputMode="decimal"
          value={Number.isNaN(value) ? '' : value}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value === '') {
              onValueChange?.(NaN);
              return;
            }
            const parsed = parseFloat(e.target.value);
            if (!Number.isNaN(parsed)) onValueChange?.(clamp(parsed));
          }}
          className={cn(
            formFieldBase,
            formFieldSingleLine,
            'pr-10 tabular-nums [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            className
          )}
          {...props}
        />
        <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col">
          <button
            type="button"
            onClick={increment}
            disabled={disabled}
            className={stepButton}
            aria-label="Sumar"
            tabIndex={-1}
          >
            <MdKeyboardArrowUp className="size-3" aria-hidden />
          </button>
          <button
            type="button"
            onClick={decrement}
            disabled={disabled}
            className={stepButton}
            aria-label="Restar"
            tabIndex={-1}
          >
            <MdKeyboardArrowDown className="size-3" aria-hidden />
          </button>
        </div>
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };
