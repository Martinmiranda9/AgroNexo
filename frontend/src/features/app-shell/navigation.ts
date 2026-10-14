import type { IconType } from 'react-icons';
import { MdOutlineAgriculture, MdOutlineGridView, MdOutlineHandshake, MdSearch } from 'react-icons/md';
import { signOutSession } from '@/core/auth/firebase-actions';
import { ROUTES } from '@/shared/constants/routes';
import type { AppUser } from './types';

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
}

/** El productor busca, sigue sus solicitudes y arma el equipo de cada campo; el profesional responde desde su panel. */
export const NAV: Record<AppUser['role'], NavItem[]> = {
  Producer: [
    { href: ROUTES.matchDiscovery, label: 'Buscar', icon: MdSearch },
    { href: ROUTES.matches, label: 'Mis solicitudes', icon: MdOutlineHandshake },
    { href: ROUTES.farms, label: 'Campos', icon: MdOutlineAgriculture },
  ],
  Professional: [
    { href: ROUTES.dashboard, label: 'Panel', icon: MdOutlineGridView },
    { href: ROUTES.matches, label: 'Solicitudes', icon: MdOutlineHandshake },
    { href: ROUTES.farms, label: 'Campos', icon: MdOutlineAgriculture },
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
