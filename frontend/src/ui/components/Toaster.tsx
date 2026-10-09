'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { CheckCircleIcon, InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';
import SwipeToast from './SwipeToast';

type ToastTone = 'success' | 'info' | 'error';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastOptions {
  description?: string;
}

const ICONS: Record<ToastTone, ReactNode> = {
  success: <CheckCircleIcon weight="fill" className="text-accent-light" />,
  info: <InfoIcon weight="fill" className="text-accent-light" />,
  error: <WarningCircleIcon weight="fill" className="text-beige" />,
};

// Cola de toasts fuera de React: cualquier componente llama a `toast()` sin necesitar un provider.
let items: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
const EMPTY: ToastItem[] = [];

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function push(tone: ToastTone, title: string, options?: ToastOptions) {
  items = [...items, { id: ++nextId, tone, title, description: options?.description }];
  emit();
}

function remove(id: number) {
  items = items.filter((item) => item.id !== id);
  emit();
}

/** Muestra un aviso breve abajo de la pantalla. `toast.success` para confirmar, `toast.error` para fallas. */
export const toast = Object.assign(
  (title: string, options?: ToastOptions) => push('info', title, options),
  {
    success: (title: string, options?: ToastOptions) => push('success', title, options),
    error: (title: string, options?: ToastOptions) => push('error', title, options),
  }
);

/**
 * Contenedor de los toasts: apila `SwipeToast` (React Bits) abajo al centro, en Pine con texto Beige y la mecha en
 * salvia. Se cierran solos, deslizándolos hacia abajo o con Escape.
 */
export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-[60] flex flex-col items-center px-4">
      {list.map((item) => (
        <div key={item.id} className="pointer-events-auto flex w-full justify-center">
          <SwipeToast
            inline
            title={item.title}
            description={item.description}
            icon={ICONS[item.tone]}
            background="var(--color-pine)"
            color="var(--color-beige)"
            fuseColor="var(--color-accent-light)"
            radius={16}
            duration={5000}
            onClose={() => remove(item.id)}
          />
        </div>
      ))}
    </div>
  );
}
