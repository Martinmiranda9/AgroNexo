import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { controlClass } from './field-styles';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

/**
 * Input base del Design System AgroNexo.
 * Soporta icono izquierdo/derecho, mensaje de error y hint.
 * Usa Pine (#00311e) como color de texto y focus, Beige (#fef7e5) como fondo.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-pine"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 text-neutral-warm">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              controlClass(!!error),
              'py-2.5',
              leftIcon ? 'pl-11' : 'pl-4',
              rightIcon ? 'pr-11' : 'pr-4',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3.5 text-neutral-warm transition-colors hover:text-pine focus:outline-none"
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-danger">
            <span>{error}</span>
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-neutral-warm">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;

