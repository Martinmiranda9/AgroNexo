'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdAdd,
  MdOutlineHelpOutline,
  MdOutlineLogout,
  MdOutlineMenu,
  MdOutlineMenuOpen,
} from 'react-icons/md';
import { NEW_FARM_ROUTE, ROUTES, farmRoute } from '@/shared/constants/routes';
import { InitialsAvatar } from '@/ui/components/Avatar';
import { Badge } from '@/ui/components/Badge';
import BrandLogo from '@/ui/components/BrandLogo';
import { Button } from '@/ui/components/Button';
import { IconButton } from '@/ui/components/IconButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/Popover';
import { Separator } from '@/ui/components/Separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
} from '@/ui/components/Sidebar';
import { Skeleton } from '@/ui/components/Skeleton';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { NAV, SPACE_CAPTION, isActiveHref, signOut } from '../navigation';
import type { AppUser } from '../types';
import ScreenGuideContent from './ScreenGuideContent';
import SearchCommand from './SearchCommand';
import WithLabel from './WithLabel';

interface AppSidebarProps {
  user: AppUser;
  /** Solicitudes esperando respuesta: contador junto a "Solicitudes". */
  pendingCount?: number;
  /** Solo los íconos. En el panel del celular siempre va expandido. */
  collapsed?: boolean;
  /** Botón de arriba para colapsar o expandir. Sin él (celular) no se muestra. */
  onToggle?: () => void;
}

/** Campos que entran en la columna; el resto se ve en "Campos". */
const MAX_FARMS = 5;

const farmInitial = (name: string) => name.trim().charAt(0).toUpperCase() || 'C';

/**
 * Sidebar del marco en una sola columna, como la referencia: arriba el logo con el espacio del usuario y el botón para
 * colapsar, la búsqueda y el menú principal; en el medio "Mis campos"; abajo la ayuda y el cierre de sesión.
 * Colapsado quedan los íconos con su nombre en tooltip; el ítem activo va en pine.
 */
export default function AppSidebar({
  user,
  pendingCount = 0,
  collapsed = false,
  onToggle,
}: AppSidebarProps) {
  const pathname = usePathname();
  const farms = useWorkspaces();
  const toggleLabel = collapsed ? 'Expandir menú' : 'Contraer menú';
  const isProducer = user.role === 'Producer';

  const activeFarms = (farms ?? []).filter((farm) => farm.archivedAt === null);
  const shownFarms = activeFarms.slice(0, MAX_FARMS);
  // Dentro de un campo de la lista, el activo es ese campo y no la sección "Campos".
  const insideListedFarm = shownFarms.some((farm) => pathname === farmRoute(farm.farmId));

  const counter = (count: number, onActive: boolean): ReactNode =>
    count > 0 ? (
      <Badge variant={onActive ? 'inverse' : 'default'} className="tabular-nums">
        {count}
        <span className="sr-only"> esperando respuesta</span>
      </Badge>
    ) : undefined;

  return (
    <Sidebar collapsed={collapsed} aria-label="Barra lateral">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-1 group-data-[collapsed=true]/sidebar:flex-col">
          <BrandLogo caption={SPACE_CAPTION[user.role]} />
          {onToggle && (
            <WithLabel label={toggleLabel} show={collapsed}>
              <IconButton
                variant="ghost"
                size="lg"
                shape="round"
                aria-label={toggleLabel}
                aria-expanded={!collapsed}
                onClick={onToggle}
              >
                {collapsed ? <MdOutlineMenu aria-hidden /> : <MdOutlineMenuOpen aria-hidden />}
              </IconButton>
            </WithLabel>
          )}
        </div>
        <SearchCommand user={user} farms={farms} collapsed={collapsed} shortcut={!!onToggle} />
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Principal">
          <SidebarGroup>
            <SidebarGroupLabel>Menú principal</SidebarGroupLabel>
            {NAV[user.role].map(({ href, label, icon: ItemIcon }) => {
              const active =
                isActiveHref(pathname, href) && !(href === ROUTES.farms && insideListedFarm);
              return (
                <WithLabel key={href} label={label} show={collapsed}>
                  <SidebarItem
                    asChild
                    active={active}
                    icon={<ItemIcon size={20} aria-hidden />}
                    badge={href === ROUTES.matches ? counter(pendingCount, active) : undefined}
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

        <Separator />

        <nav aria-label="Mis campos">
          <SidebarGroup>
            <SidebarGroupLabel
              action={
                isProducer && (
                  <Button asChild variant="ghost" size="icon-xs">
                    <Link href={NEW_FARM_ROUTE} aria-label="Nuevo campo">
                      <MdAdd aria-hidden />
                    </Link>
                  </Button>
                )
              }
            >
              Mis campos
            </SidebarGroupLabel>

            {farms === null ? (
              [0, 1].map((row) => <Skeleton key={row} className="h-10 w-full rounded-full" />)
            ) : shownFarms.length === 0 ? (
              <p className="text-caption text-muted-foreground px-3 group-data-[collapsed=true]/sidebar:sr-only">
                {isProducer ? 'Todavía no creaste campos.' : 'Todavía no te sumaron a un campo.'}
              </p>
            ) : (
              shownFarms.map((farm) => {
                const href = farmRoute(farm.farmId);
                const active = pathname === href;
                return (
                  <WithLabel key={farm.farmId} label={farm.name} show={collapsed}>
                    <SidebarItem
                      asChild
                      active={active}
                      icon={
                        <InitialsAvatar
                          initials={farmInitial(farm.name)}
                          size="xs"
                          tone={active ? 'inverse' : 'tint'}
                        />
                      }
                    >
                      <Link href={href} aria-current={active ? 'page' : undefined}>
                        {farm.name}
                      </Link>
                    </SidebarItem>
                  </WithLabel>
                );
              })
            )}

            {activeFarms.length > MAX_FARMS && (
              <SidebarItem asChild className="group-data-[collapsed=true]/sidebar:sr-only">
                <Link href={ROUTES.farms}>Ver todos ({activeFarms.length})</Link>
              </SidebarItem>
            )}
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
