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
import PageBreadcrumb from './PageBreadcrumb';
import ScreenGuideContent from './ScreenGuideContent';
import UserMenu from './UserMenu';

interface AppHeaderProps {
  user: AppUser;
  /** Solicitudes esperando respuesta: contador junto a "Solicitudes" en el menú del celular. */
  pendingCount?: number;
}

/**
 * Barra de arriba del contenido: a la izquierda dónde está el usuario y a la derecha avisos, ayuda y el perfil. El logo y la búsqueda viven en el sidebar;
 * en celular y tablet, donde el sidebar no se ve, la barra suma el botón de menú (abre el sidebar en un panel) y el logo.
 */
export default function AppHeader({ user, pendingCount = 0 }: AppHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Al elegir una sección en el panel del celular, el panel se cierra.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="bg-canvas/85 sticky top-0 z-30 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <div className="flex items-center gap-3 lg:hidden">
          <IconButton
            variant="surface"
            size="lg"
            shape="round"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
          >
            <MdOutlineMenu aria-hidden />
          </IconButton>
          <BrandLogo compactOnMobile />
        </div>
        <div className="hidden min-w-0 lg:block">
          <PageBreadcrumb user={user} />
        </div>

        <div className="ml-auto flex items-center gap-2">
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
          <UserMenu user={user} />
        </div>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} swipeDirection="left">
        <DrawerContent className="p-0">
          <DrawerTitle className="sr-only">Menú</DrawerTitle>
          <AppSidebar user={user} pendingCount={pendingCount} />
        </DrawerContent>
      </Drawer>
    </header>
  );
}
