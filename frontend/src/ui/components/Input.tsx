import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/shared/utils/cn';
import { formFieldBase, formFieldSingleLine } from './_shared';

// Cashmere Input (registro `cashmere/input-base`) sobre el Input de Base UI.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        formFieldBase,
        formFieldSingleLine,
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  );
}

export { Input };
