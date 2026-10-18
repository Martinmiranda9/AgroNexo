'use client';

import * as React from 'react';
import { MdClose, MdOutlineSearch } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { formFieldBase, formFieldSingleLine } from './_shared';

/*
 * Cashmere SearchInput (registro `cashmere/search-input-base`): campo de búsqueda con lupa y botón para limpiar.
 * AgroNexo: íconos Material y textos en español.
 */

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  onClear?: () => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== '';

    return (
      <div className="relative">
        <MdOutlineSearch
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            formFieldBase,
            formFieldSingleLine,
            'pl-9',
            hasValue && onClear && 'pr-9',
            '[&::-webkit-search-cancel-button]:appearance-none',
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1',
              'text-muted-foreground transition-colors duration-150',
              'hover:text-foreground hover:bg-accent',
              'focus:ring-ring/40 focus:ring-2 focus:outline-none'
            )}
            aria-label="Limpiar búsqueda"
          >
            <MdClose className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
