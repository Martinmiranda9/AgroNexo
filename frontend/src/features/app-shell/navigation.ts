import {
  FarmIcon,
  HandshakeIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  type Icon,
} from '@phosphor-icons/react';
import { signOutSession } from '@/core/auth/firebase-actions';
import { ROUTES } from '@/shared/constants/routes';
import type { AppUser } from './types';

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
}

/** El productor busca, sigue sus solicitudes y arma el equipo de cada campo; el profesional responde desde su panel. */
export const NAV: Record<AppUser['role'], NavItem[]> = {
  Producer: [
    { href: ROUTES.matchDiscovery, label: 'Buscar', icon: MagnifyingGlassIcon },
    { href: ROUTES.matches, label: 'Mis solicitudes', icon: HandshakeIcon },
    { href: ROUTES.farms, label: 'Campos', icon: FarmIcon },
  ],
  Professional: [
    { href: ROUTES.dashboard, label: 'Panel', icon: SquaresFourIcon },
    { href: ROUTES.matches, label: 'Solicitudes', icon: HandshakeIcon },
    { href: ROUTES.farms, label: 'Campos', icon: FarmIcon },
  ],
};

export const ROLE_CAPTION: Record<AppUser['role'], string> = {
  Producer: 'Productor',
  Professional: 'Profesional',
};

export const initialsOf = (user: AppUser) =>
  `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() || 'AN';

export const displayNameOf = (user: AppUser) =>
  `${user.firstName} ${user.lastName}`.trim() || 'Mi cuenta';

/** Cierra la sesión de Firebase y vuelve al login aunque el cierre falle (la cookie ya no sirve). */
export async function signOut() {
  try {
    await signOutSession();
  } finally {
    window.location.assign(ROUTES.login);
  }
}
