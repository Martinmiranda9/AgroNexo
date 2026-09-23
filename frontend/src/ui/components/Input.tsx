import * as React from 'react';
import { cn } from '@/shared/utils/cn';

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
            className="text-sm font-medium text-[#00311e]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 text-[#978A56]">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-[12px] border bg-[#fef7e5] py-2.5 text-sm text-[#00311e] placeholder:text-[#978A56]',
              'transition-all duration-200 outline-none',
              'focus:border-[#00311e] focus:ring-2 focus:ring-[#00311e]/15',
              error
                ? 'border-[#8C4A34] focus:border-[#8C4A34] focus:ring-[#8C4A34]/20'
                : 'border-[#978A56]/50 hover:border-[#00311e]/40',
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
              className="absolute right-3.5 text-[#978A56] transition-colors hover:text-[#00311e] focus:outline-none"
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-[#8C4A34]">
            <span>{error}</span>
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-[#978A56]">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;

