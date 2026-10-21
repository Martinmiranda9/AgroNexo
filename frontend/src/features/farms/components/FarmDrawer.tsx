'use client';

import type { CSSProperties, ReactNode } from 'react';
import { MdClose } from 'react-icons/md';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/ui/components/Button';
import { Drawer, DrawerClose, DrawerContent } from '@/ui/components/Drawer';

/** Las tres franjas del panel, igual que la solicitud de match: encabezado fijo, cuerpo con scroll y pie con acciones. */
export const DRAWER_HEADER =
  'relative px-6 pt-6 pb-4 text-left group-data-[swipe-axis=y]/drawer-popup:text-left';
export const DRAWER_BODY = 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6';
export const DRAWER_FOOTER =
  'border-border bg-card mt-0 flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end';

/**
 * Pantalla completa con mapa: los datos a la izquierda (con su scroll) y el mapa ocupando el resto. En celular, los
 * datos arriba y el mapa abajo.
 */
export const DRAWER_SPLIT_BODY =
  'flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 lg:grid lg:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)] lg:overflow-hidden';
export const DRAWER_SPLIT_FIELDS = 'flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1';
export const DRAWER_SPLIT_ASIDE = 'flex min-h-[28rem] flex-col gap-3 lg:min-h-0';

/** En escritorio entra desde la derecha como card flotante; en celular, como hoja desde abajo. */
const RIGHT_PANEL_STYLE = {
  '--drawer-inset': '0.75rem',
  '--drawer-content-width': 'min(34rem, calc(100vw - 1.5rem))',
} as CSSProperties;

/** Pantalla completa: en escritorio, todo el ancho menos un margen; en celular, casi todo el alto. */
const FULL_DESKTOP_STYLE = {
  '--drawer-inset': '0.75rem',
  '--drawer-content-width': 'calc(100vw - 1.5rem)',
} as CSSProperties;
const FULL_MOBILE_STYLE = {
  '--drawer-height': 'calc(100dvh - 0.75rem)',
  '--drawer-content-max-height': 'calc(100dvh - 0.75rem)',
} as CSSProperties;

interface FarmDrawerProps {
  open: boolean;
  onClose: () => void;
  /** `panel`: card angosta a la derecha. `full`: pantalla completa, para formularios con mapa. */
  size?: 'panel' | 'full';
  children: ReactNode;
}

/** El Drawer de las acciones de campos (crear, invitar, sumar a un campo), con el mismo formato que la solicitud. */
export default function FarmDrawer({ open, onClose, size = 'panel', children }: FarmDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const style =
    size === 'full'
      ? isDesktop
        ? FULL_DESKTOP_STYLE
        : FULL_MOBILE_STYLE
      : isDesktop
        ? RIGHT_PANEL_STYLE
        : undefined;

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      swipeDirection={isDesktop ? 'right' : 'down'}
      showSwipeHandle={!isDesktop}
    >
      <DrawerContent style={style} className={cn(isDesktop && 'rounded-2xl border')}>
        {children}
      </DrawerContent>
    </Drawer>
  );
}

export function FarmDrawerCloseButton() {
  return (
    <DrawerClose
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 rounded-full"
          aria-label="Cerrar"
        />
      }
    >
      <MdClose size={16} aria-hidden />
    </DrawerClose>
  );
}
