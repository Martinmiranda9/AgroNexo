'use client';

import { CaretDownIcon, SignOutIcon } from '@phosphor-icons/react';
import { signOutSession } from '@/core/auth/firebase-actions';
import Avatar from '@/ui/components/Avatar';
import BrandLogo from '@/ui/components/BrandLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import type { MatchDiscoveryUser } from '../types';

const initialsOf = (user: MatchDiscoveryUser) =>
  `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() || 'AN';

async function signOut() {
  try {
    await signOutSession();
  } finally {
    window.location.assign('/login');
  }
}

/** Encabezado de la pantalla: logo a la izquierda; nombre y ID público del usuario (con menú de sesión) a la derecha. */
export default function MatchDiscoveryHeader({ user }: { user: MatchDiscoveryUser }) {
  const name = `${user.firstName} ${user.lastName}`.trim() || 'Mi cuenta';

  return (
    <header className="border-border bg-paper/80 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Menú de ${name}`}
            className="rounded-pill border-border bg-surface hover:bg-secondary focus-visible:border-ring focus-visible:ring-ring/50 flex h-12 items-center gap-2.5 border py-1 pr-3 pl-1 text-left transition-colors outline-none focus-visible:ring-3"
          >
            <Avatar initials={initialsOf(user)} size="md" tone="solid" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-body-sm text-pine hidden max-w-[16ch] truncate font-semibold sm:block">
                {name}
              </span>
              {user.publicId !== null && (
                <span className="text-caption text-olive font-mono">ID #{user.publicId}</span>
              )}
            </span>
            <CaretDownIcon size={14} weight="bold" className="text-olive" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="bg-surface min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                <span className="text-body-sm text-pine font-semibold">{name}</span>
                <span className="text-caption text-olive">Productor</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <SignOutIcon size={16} aria-hidden />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
