'use client';

import { MdKeyboardArrowDown, MdOutlineLogout } from 'react-icons/md';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/components/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { ROLE_CAPTION, displayNameOf, initialsOf, signOut } from '../navigation';
import type { AppUser } from '../types';

/** Perfil del encabezado: avatar, nombre en negrita y rol debajo, con el cierre de sesión en el menú. */
export default function UserMenu({ user }: { user: AppUser }) {
  const name = displayNameOf(user);
  const role = ROLE_CAPTION[user.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${name}, menú de la cuenta`}
        className="border-border bg-card hover:bg-field-100 data-popup-open:bg-field-100 focus-visible:ring-ring/50 flex h-12 items-center gap-2.5 rounded-full border py-1 pr-3 pl-1 text-left [box-shadow:var(--shadow-s)] transition-colors outline-none focus-visible:ring-3"
      >
        {/* La foto es la de la cuenta (Google); sin foto o si no carga, quedan las iniciales. */}
        <Avatar size="lg">
          <AvatarImage src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
          <AvatarFallback className="bg-pine font-semibold text-white">
            {initialsOf(user)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 flex-col leading-tight md:flex">
          <span className="text-body-sm text-foreground max-w-[18ch] truncate font-semibold">
            {name}
          </span>
          <span className="text-caption text-muted-foreground">{role}</span>
        </span>
        <MdKeyboardArrowDown size={18} className="text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
            <span className="text-body-sm text-foreground font-semibold">{name}</span>
            <span className="text-caption text-muted-foreground tabular-nums">
              {role}
              {user.publicId !== null && ` · ID ${user.publicId}`}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <MdOutlineLogout size={16} aria-hidden />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
