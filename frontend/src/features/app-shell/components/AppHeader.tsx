'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdKeyboardArrowDown, MdLogout } from 'react-icons/md';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/ui/components/AvatarShadcn';
import BrandLogo from '@/ui/components/BrandLogo';
import { Button } from '@/ui/components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { NAV, ROLE_CAPTION, displayNameOf, initialsOf, signOut } from '../navigation';
import type { AppUser } from '../types';

interface AppHeaderProps {
  user: AppUser;
  /** Solicitudes esperando respuesta: se muestra como contador junto a "Solicitudes". */
  pendingCount?: number;
}

/**
 * Encabezado de las pantallas autenticadas: logo, navegación principal (Buscar ↔ Mis solicitudes ↔ Campos) y menú
 * de cuenta.
 * Arriba de todo es transparente y deja ver el brillo; al bajar toma fondo y borde.
 */
export default function AppHeader({ user, pendingCount = 0 }: AppHeaderProps) {
  const pathname = usePathname();
  const name = displayNameOf(user);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b transition-colors',
        scrolled ? 'border-border bg-paper/80 backdrop-blur-xl' : 'border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6">
        {/* BrandLogo ya es un link al inicio: no se envuelve en otro. */}
        <BrandLogo />

        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Principal" className="flex items-center gap-1">
            {NAV[user.role].map(({ href, label, icon: ItemIcon }) => {
              const active = pathname === href;
              const showCount = href === ROUTES.matches && pendingCount > 0;
              return (
                <Button
                  key={href}
                  variant={active ? 'secondary' : 'ghost'}
                  render={<Link href={href} aria-current={active ? 'page' : undefined} />}
                  nativeButton={false}
                  className="max-sm:px-3"
                >
                  <ItemIcon data-icon="inline-start" size={18} aria-hidden />
                  <span className="max-sm:sr-only">{label}</span>
                  {showCount && (
                    <span className="bg-pine text-beige text-caption rounded-pill min-w-5 px-1.5 font-mono">
                      {pendingCount}
                      <span className="sr-only"> esperando respuesta</span>
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Menú de ${name}`}
              className="rounded-pill border-border bg-surface hover:bg-secondary focus-visible:border-ring focus-visible:ring-ring/50 flex h-12 items-center gap-2.5 border py-1 pr-3 pl-1 text-left transition-colors outline-none focus-visible:ring-3"
            >
              {/* La foto es la de la cuenta (Google); sin foto o si no carga, quedan las iniciales. El punto indica sesión activa. */}
              <Avatar size="lg">
                <AvatarImage src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {initialsOf(user)}
                </AvatarFallback>
                <AvatarBadge aria-hidden className="bg-accent-mid ring-surface" />
              </Avatar>
              <span className="hidden min-w-0 flex-col leading-tight md:flex">
                <span className="text-body-sm text-pine max-w-[16ch] truncate font-semibold">
                  {name}
                </span>
                {user.publicId !== null && (
                  <span className="text-caption text-dark font-medium tabular-nums">
                    ID {user.publicId}
                  </span>
                )}
              </span>
              <MdKeyboardArrowDown size={14} className="text-olive" aria-hidden />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-surface min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                  <span className="text-body-sm text-pine font-semibold">{name}</span>
                  <span className="text-caption text-olive">{ROLE_CAPTION[user.role]}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <MdLogout size={16} aria-hidden />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
