import * as React from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { cn } from '@/shared/utils/cn';
import { controlClass } from './field-styles';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: SelectOption[];
  onValueChange?: (value: string) => void;
}

/** Select nativo con el mismo lenguaje visual que Input (accesible y cómodo en mobile). */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, placeholder, options, onValueChange, className, id, value, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-pine">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value}
            aria-invalid={!!error}
            onChange={(e) => onValueChange?.(e.target.value)}
            className={cn(
              controlClass(!!error),
              'h-12 cursor-pointer appearance-none pl-4 pr-10',
              !value && 'text-neutral-warm',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value} className="text-pine">
                {o.label}
              </option>
            ))}
          </select>
          <CaretDown
            size={16}
            weight="bold"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-warm"
            aria-hidden
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-warm">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
