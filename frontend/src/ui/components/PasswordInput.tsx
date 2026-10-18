'use client';

import * as React from 'react';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { formFieldBase, formFieldSingleLine } from './_shared';

/*
 * Cashmere PasswordInput (registro `cashmere/password-input-base`): el ojo va adentro del campo. AgroNexo: íconos
 * Material, textos en español y el botón se puede alcanzar con el teclado (el registro lo saca del tab).
 */
export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative" data-slot="password-input">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(formFieldBase, formFieldSingleLine, 'pr-11', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className={cn(
            'absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md',
            'text-muted-foreground transition-colors duration-150',
            'hover:bg-accent hover:text-foreground',
            'focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none'
          )}
          aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
          aria-pressed={visible}
        >
          {visible ? (
            <MdOutlineVisibilityOff className="size-4" aria-hidden />
          ) : (
            <MdOutlineVisibility className="size-4" aria-hidden />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
