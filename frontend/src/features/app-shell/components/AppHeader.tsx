'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  MdOutlineInfo,
  MdOutlineMenu,
  MdOutlineNotifications,
  MdOutlineNotificationsNone,
} from 'react-icons/md';
import BrandLogo from '@/ui/components/BrandLogo';
import { Drawer, DrawerContent, DrawerTitle } from '@/ui/components/Drawer';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui/components/Empty';
import { IconButton } from '@/ui/components/IconButton';
import { PopoverHeader, PopoverTitle } from '@/ui/components/Popover';
import type { AppUser } from '../types';
import AppSidebar from './AppSidebar';
import HeaderPopoverButton from './HeaderPopoverButton';
import ScreenGuideContent from './ScreenGuideContent';
import SearchCommand from './SearchCommand';
import UserMenu from './UserMenu';

interface AppHeaderProps {
  user: AppUser;
  /** Solicitudes esperando respuesta: contador junto a "Solicitudes" en el menú del celular. */
  pendingCount?: number;
}

/** Pastilla blanca del encabezado, como las de la referencia. */
const PILL =
  'border-border bg-card flex h-12 items-center rounded-full border [box-shadow:var(--shadow-s)]';

/**
 * Encabezado del marco: logo a la izquierda y, a la derecha, la pastilla de búsqueda, avisos y ayuda, y el perfil.
 * En celular y tablet suma el botón que abre el sidebar en un panel lateral.
 */
export default function AppHeader({ user, pendingCount = 0 }: AppHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Al elegir una sección en el panel del celular, el panel se cierra.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="bg-canvas/85 sticky top-0 z-30 backdrop-blur-xl">
      <div className="flex h-19 items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <div className={`${PILL} px-1 lg:hidden`}>
          <IconButton
            variant="ghost"
            size="lg"
            shape="round"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
          >
            <MdOutlineMenu aria-hidden />
          </IconButton>
        </div>

        {/* BrandLogo ya es un link al inicio: no se envuelve en otro. */}
        <div className={`${PILL} px-1.5 sm:pr-4`}>
          <BrandLogo compactOnMobile />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className={`${PILL} gap-0.5 px-1`}>
            <SearchCommand user={user} />
            <HeaderPopoverButton label="Avisos" icon={<MdOutlineNotifications aria-hidden />}>
              <PopoverHeader>
                <PopoverTitle>Avisos</PopoverTitle>
              </PopoverHeader>
              <Empty className="p-4">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MdOutlineNotificationsNone aria-hidden />
                  </EmptyMedia>
                  <EmptyTitle>Sin novedades</EmptyTitle>
                  <EmptyDescription>
                    Acá vas a ver los avisos de tus campos y solicitudes.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </HeaderPopoverButton>
            <HeaderPopoverButton label="Ayuda" icon={<MdOutlineInfo aria-hidden />}>
              <ScreenGuideContent pathname={pathname} />
            </HeaderPopoverButton>
          </div>
          <UserMenu user={user} />
        </div>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} swipeDirection="left">
        <DrawerContent className="bg-canvas p-4">
          <DrawerTitle className="sr-only">Menú</DrawerTitle>
          <AppSidebar user={user} pendingCount={pendingCount} />
        </DrawerContent>
      </Drawer>
    </header>
  );
}
