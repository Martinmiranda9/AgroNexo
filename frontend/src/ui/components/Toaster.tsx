'use client';

import type { IconType } from 'react-icons';
import { MdCheckCircleOutline, MdErrorOutline, MdInfoOutline } from 'react-icons/md';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './Toast';
import { toast as pushToast, useToast } from './use-toast';

const TOAST_DURATION_MS = 4000;

const VARIANT_ICON: Record<'success' | 'info' | 'destructive', IconType> = {
  success: MdCheckCircleOutline,
  info: MdInfoOutline,
  destructive: MdErrorOutline,
};

// Cashmere Toaster (registro `cashmere/toaster`). Va una vez en el layout autenticado. Cada aviso dura 4 segundos.
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right" label="Notificación" duration={TOAST_DURATION_MS}>
      {toasts.map(({ id, title, description, action, ...props }) => {
        const Icon = VARIANT_ICON[props.variant ?? 'info'];
        return (
          <Toast key={id} {...props}>
            <Icon className="size-5 shrink-0 self-start" aria-hidden />
            <div className="grid flex-1 gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

interface ToastOptions {
  description?: string;
}

/**
 * Atajo de AgroNexo sobre el `toast` de Cashmere: `toast(título)` y `toast.info` informan (negro), `toast.success`
 * confirma una acción (verde) y `toast.error` avisa de una falla o de algo que se borra (rojo, variante `destructive`).
 */
export const toast = Object.assign(
  (title: string, options?: ToastOptions) =>
    pushToast({ title, description: options?.description, variant: 'info' }),
  {
    info: (title: string, options?: ToastOptions) =>
      pushToast({ title, description: options?.description, variant: 'info' }),
    success: (title: string, options?: ToastOptions) =>
      pushToast({ title, description: options?.description, variant: 'success' }),
    error: (title: string, options?: ToastOptions) =>
      pushToast({ title, description: options?.description, variant: 'destructive' }),
  }
);
