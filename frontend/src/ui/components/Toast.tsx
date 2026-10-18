// Cashmere Toast (registro `cashmere/toast`, Radix Toast) con el look de "Alert with Icons". AgroNexo: ícono de cerrar
// Material, textos en español, arriba a la derecha y tres variantes sobre fondo blanco: success (verde), info (negro)
// y destructive (rojo), con texto e ícono del mismo color.
'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { MdClose } from 'react-icons/md';

import { cn } from '@/shared/utils/cn';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:max-w-[26.25rem]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden p-4',
    'rounded-xl border',
    '[box-shadow:var(--shadow-l)]',
    'transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
  ].join(' '),
  {
    variants: {
      variant: {
        success: 'bg-card text-success border-success/40',
        info: 'bg-card text-foreground border-foreground/25',
        destructive: 'bg-card text-destructive border-destructive/40',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-3',
      'border-border bg-secondary text-secondary-foreground border',
      '[box-shadow:var(--shadow-s)]',
      'text-sm font-medium transition-[background-color,box-shadow] duration-150',
      'hover:bg-accent hover:[box-shadow:var(--shadow-m)]',
      'focus:ring-ring/40 focus:ring-2 focus:outline-none',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute top-2 right-2 rounded-lg p-1 opacity-60 transition-[opacity,background-color] duration-150',
      'hover:bg-accent hover:opacity-100',
      'focus:ring-ring/40 focus:opacity-100 focus:ring-2 focus:outline-none',
      className
    )}
    toast-close=""
    {...props}
  >
    <MdClose className="h-4 w-4" aria-hidden />
    <span className="sr-only">Cerrar</span>
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm leading-relaxed opacity-80', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
