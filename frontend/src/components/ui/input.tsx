import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-input border border-neutral-warm/30 bg-white px-4 py-2 text-sm text-dark',
            'placeholder:text-neutral-warm/60',
            'transition-all duration-150',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:bg-bg-page disabled:text-neutral-warm',
            'read-only:cursor-default read-only:bg-bg-page read-only:text-neutral-warm',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className,
          )}
          ref={ref}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
