import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'pine';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Botón base del Design System AgroNexo.
 * Variantes:
 *  - primary: Pine (#00311e) fondo + Beige (#fef7e5) texto — CTA principal de alto contraste
 *  - pine: alias de primary (explícito para contextos de branding)
 *  - outline: borde Pine, texto Pine, fondo transparente
 *  - ghost: plano, texto Pine, hover Beige
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pine disabled:opacity-50 disabled:pointer-events-none rounded-[12px] select-none';

    const variants = {
      primary:
        'bg-[#00311e] text-[#fef7e5] hover:bg-[#002617] active:scale-[0.98] shadow-sm',
      pine:
        'bg-[#00311e] text-[#fef7e5] hover:bg-[#002617] active:scale-[0.98] shadow-sm',
      outline:
        'border border-[#00311e]/40 bg-transparent text-[#00311e] hover:bg-[#fef7e5] hover:border-[#00311e]/70 active:scale-[0.98]',
      ghost: 'bg-transparent text-[#00311e] hover:bg-[#fef7e5] active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-9 px-4 text-body-sm',
      md: 'h-11 px-5 text-body',
      lg: 'h-13 px-6 text-body',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
