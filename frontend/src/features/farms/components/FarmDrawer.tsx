'use client';

import type { CSSProperties, ReactNode } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/ui/components/Button';
import { Drawer, DrawerClose, DrawerContent } from '@/ui/components/Drawer';

/** Las tres franjas del panel, igual que la solicitud de match: encabezado fijo, cuerpo con scroll y pie con acciones. */
export const DRAWER_HEADER =
  'relative px-6 pt-6 pb-4 text-left group-data-[swipe-axis=y]/drawer-popup:text-left';
export const DRAWER_BODY = 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6';
export const DRAWER_FOOTER =
  'border-border bg-surface mt-0 flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end';

/** En escritorio entra desde la derecha como card flotante; en celular, como hoja desde abajo. */
const RIGHT_PANEL_STYLE = {
  '--drawer-inset': '0.75rem',
  '--drawer-content-width': 'min(34rem, calc(100vw - 1.5rem))',
} as CSSProperties;

interface FarmDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** El Drawer de las acciones de campos (crear, invitar, sumar a un campo), con el mismo formato que la solicitud. */
export default function FarmDrawer({ open, onClose, children }: FarmDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      swipeDirection={isDesktop ? 'right' : 'down'}
      showSwipeHandle={!isDesktop}
    >
      <DrawerContent
        style={isDesktop ? RIGHT_PANEL_STYLE : undefined}
        className={cn(
          'bg-surface',
          isDesktop && 'rounded-shell border-pine/10 ring-pine/5 border ring-4'
        )}
      >
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
      <XIcon size={16} aria-hidden />
    </DrawerClose>
  );
}
