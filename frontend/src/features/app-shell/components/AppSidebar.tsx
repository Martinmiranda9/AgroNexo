'use client';

import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdOutlineHelpOutline,
  MdOutlineLogout,
  MdOutlineMenu,
  MdOutlineMenuOpen,
} from 'react-icons/md';
import { ROUTES } from '@/shared/constants/routes';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/Popover';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
} from '@/ui/components/Sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/Tooltip';
import { NAV, isActiveHref, signOut } from '../navigation';
import type { AppUser } from '../types';
import ScreenGuideContent from './ScreenGuideContent';

interface AppSidebarProps {
  user: AppUser;
  /** Solicitudes esperando respuesta: contador junto a "Solicitudes". */
  pendingCount?: number;
  /** Solo los íconos. En el panel del celular siempre va expandido. */
  collapsed?: boolean;
  /** Botón de arriba para colapsar o expandir. Sin él (celular) no se muestra. */
  onToggle?: () => void;
}

/** Con la barra colapsada, el nombre de la sección aparece en un tooltip a la derecha del ícono. */
function WithLabel({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: ReactElement;
}) {
  return (
    <Tooltip disabled={!show}>
      <TooltipTrigger render={children} />
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Sidebar del marco: tres pastillas blancas (colapsar, secciones, ayuda y cierre de sesión), como la columna de la
 * referencia. Colapsado quedan los íconos con su nombre en tooltip; el ítem activo va en pine.
 */
export default function AppSidebar({
  user,
  pendingCount = 0,
  collapsed = false,
  onToggle,
}: AppSidebarProps) {
  const pathname = usePathname();
  const toggleLabel = collapsed ? 'Expandir menú' : 'Contraer menú';

  const counter = (count: number): ReactNode =>
    count > 0 ? (
      <span className="bg-field-700 text-caption flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-semibold text-white tabular-nums">
        {count}
        <span className="sr-only"> esperando respuesta</span>
      </span>
    ) : undefined;

  return (
    <Sidebar variant="floating" collapsed={collapsed} aria-label="Barra lateral">
      {onToggle && (
        <SidebarHeader>
          <WithLabel label={toggleLabel} show={collapsed}>
            <SidebarItem
              onClick={onToggle}
              aria-expanded={!collapsed}
              icon={
                collapsed ? (
                  <MdOutlineMenu size={20} aria-hidden />
                ) : (
                  <MdOutlineMenuOpen size={20} aria-hidden />
                )
              }
            >
              {toggleLabel}
            </SidebarItem>
          </WithLabel>
        </SidebarHeader>
      )}

      <SidebarContent>
        <nav aria-label="Principal">
          <SidebarGroup>
            {NAV[user.role].map(({ href, label, icon: ItemIcon }) => {
              const active = isActiveHref(pathname, href);
              return (
                <WithLabel key={href} label={label} show={collapsed}>
                  <SidebarItem
                    asChild
                    active={active}
                    icon={<ItemIcon size={20} aria-hidden />}
                    badge={href === ROUTES.matches ? counter(pendingCount) : undefined}
                  >
                    <Link href={href} aria-current={active ? 'page' : undefined}>
                      {label}
                    </Link>
                  </SidebarItem>
                </WithLabel>
              );
            })}
          </SidebarGroup>
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <Popover>
          <WithLabel label="Ayuda" show={collapsed}>
            <PopoverTrigger
              render={<SidebarItem icon={<MdOutlineHelpOutline size={20} aria-hidden />} />}
            >
              Ayuda
            </PopoverTrigger>
          </WithLabel>
          <PopoverContent side="right" align="end" sideOffset={10}>
            <ScreenGuideContent pathname={pathname} />
          </PopoverContent>
        </Popover>
        <WithLabel label="Cerrar sesión" show={collapsed}>
          <SidebarItem onClick={signOut} icon={<MdOutlineLogout size={20} aria-hidden />}>
            Cerrar sesión
          </SidebarItem>
        </WithLabel>
      </SidebarFooter>
    </Sidebar>
  );
}
