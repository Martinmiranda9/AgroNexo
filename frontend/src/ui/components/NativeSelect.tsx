import * as React from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { formFieldBase, formFieldSingleLine } from './_shared';

/*
 * Cashmere NativeSelect (registro `cashmere/native-select-base`). Conserva el `size` y los subcomponentes
 * Option/OptGroup que ya usaba la app; la flecha es Material en vez de Phosphor.
 */
type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default';
};

function NativeSelect({ className, size = 'default', ...props }: NativeSelectProps) {
  return (
    <div
      className={cn('relative w-fit has-[select:disabled]:opacity-50', className)}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          formFieldBase,
          formFieldSingleLine,
          'cursor-pointer appearance-none pr-9 data-[size=sm]:h-8',
          'disabled:pointer-events-none'
        )}
        {...props}
      />
      <MdKeyboardArrowDown
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-70"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return <option data-slot="native-select-option" className={className} {...props} />;
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return <optgroup data-slot="native-select-optgroup" className={className} {...props} />;
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
