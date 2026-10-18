import type { IconType } from 'react-icons';
import {
  MdOutlineAgriculture,
  MdOutlineGridView,
  MdOutlineHandshake,
  MdOutlineSearch,
} from 'react-icons/md';
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
    { href: ROUTES.matchDiscovery, label: 'Buscar', icon: MdOutlineSearch },
    { href: ROUTES.matches, label: 'Mis solicitudes', icon: MdOutlineHandshake },
    { href: ROUTES.farms, label: 'Campos', icon: MdOutlineAgriculture },
  ],
  Professional: [
    { href: ROUTES.dashboard, label: 'Panel', icon: MdOutlineGridView },
    { href: ROUTES.matches, label: 'Solicitudes', icon: MdOutlineHandshake },
    { href: ROUTES.farms, label: 'Campos', icon: MdOutlineAgriculture },
  ],
};

/** Ítem activo: la sección exacta o una pantalla de adentro (`/farms/123` marca "Campos"). */
export const isActiveHref = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export interface ScreenGuide {
  title: string;
  steps: string[];
}

/** Guía corta de cada pantalla, para el botón de ayuda. La primera que coincide con la ruta gana. */
const GUIDES: { match: (pathname: string) => boolean; guide: ScreenGuide }[] = [
  {
    match: (pathname) => pathname.startsWith(`${ROUTES.farms}/`),
    guide: {
      title: 'Tablero del campo',
      steps: [
        'Arriba elegís la campaña; los números y gráficos se actualizan con ella.',
        'Registrá actividades y cambiales el estado a medida que avanzan.',
        'El productor arma lotes, campañas y suma profesionales al equipo.',
      ],
    },
  },
  {
    match: (pathname) => pathname === ROUTES.farms,
    guide: {
      title: 'Campos',
      steps: [
        'Cada campo es el espacio de trabajo con tu equipo.',
        'El productor crea campos y suma profesionales con match aceptado.',
        'Entrá a un campo para ver su tablero.',
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith(ROUTES.matches),
    guide: {
      title: 'Solicitudes',
      steps: [
        'Acá están las solicitudes de trabajo entre productores y profesionales.',
        'Abrí una para ver la zona, las hectáreas, la urgencia y lo que se necesita.',
        'Con la solicitud aceptada, las dos partes ven el contacto de la otra.',
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith(ROUTES.matchDiscovery),
    guide: {
      title: 'Buscar',
      steps: [
        'Contá qué necesitás en tu campo y la zona.',
        'Te recomendamos profesionales y les mandás una solicitud.',
      ],
    },
  },
];

const DEFAULT_GUIDE: ScreenGuide = {
  title: 'Panel',
  steps: [
    'Desde el menú de la izquierda vas a cada sección.',
    'Con la lupa o Ctrl + K buscás secciones y campos.',
  ],
};

export const guideFor = (pathname: string): ScreenGuide =>
  GUIDES.find(({ match }) => match(pathname))?.guide ?? DEFAULT_GUIDE;

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
