'use client';

import { usePathname } from 'next/navigation';
import { SignOutIcon } from '@phosphor-icons/react';
import { NewFarmButton } from '@/features/farms';
import { ROUTES } from '@/shared/constants/routes';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/components/AvatarShadcn';
import BrandLogo from '@/ui/components/BrandLogo';
import Sidebar from '@/ui/layouts/Sidebar';
import { NAV, ROLE_CAPTION, displayNameOf, initialsOf, signOut } from '../navigation';
import type { AppUser } from '../types';

interface AppSidebarProps {
  user: AppUser;
  /** Solicitudes esperando respuesta: contador junto a "Solicitudes". */
  pendingCount?: number;
}

/**
 * Barra lateral de escritorio: la misma navegación del encabezado, con la cuenta y el cierre de sesión abajo. Al
 * productor le suma "Nuevo campo" entre el logo y la navegación.
 */
export default function AppSidebar({ user, pendingCount = 0 }: AppSidebarProps) {
  const pathname = usePathname();
  const name = displayNameOf(user);

  const items = NAV[user.role].map((item) => ({
    ...item,
    active: pathname === item.href,
    count: item.href === ROUTES.matches ? pendingCount : undefined,
    countLabel: 'esperando respuesta',
  }));

  return (
    <Sidebar
      brand={<BrandLogo variant="dark" />}
      label="Principal"
      items={items}
      action={
        // Solo el productor crea campos; se puede antes o después de tener un match.
        user.role === 'Producer' ? (
          <NewFarmButton className="border-sidebar-foreground/30 text-sidebar-primary-foreground hover:bg-sidebar-accent focus-visible:border-sidebar-ring focus-visible:ring-sidebar-ring/40 h-11 w-full border bg-transparent" />
        ) : undefined
      }
      footer={
        <div className="flex items-center gap-3 px-2">
          <Avatar size="lg">
            <AvatarImage src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
            <AvatarFallback className="bg-sidebar-foreground text-sidebar font-semibold">
              {initialsOf(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-body-sm text-sidebar-primary-foreground truncate font-semibold">
              {name}
            </span>
            <span className="text-caption text-field-300 truncate tabular-nums">
              {ROLE_CAPTION[user.role]}
              {user.publicId !== null && ` · ID ${user.publicId}`}
            </span>
          </div>
          <button
            type="button"
            onClick={signOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-sidebar-ring flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2"
          >
            <SignOutIcon size={20} aria-hidden />
          </button>
        </div>
      }
    />
  );
}
