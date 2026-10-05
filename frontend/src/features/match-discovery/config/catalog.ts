import type { ProfessionalRole, SearchableRole } from '@/core/models/identity.model';

export const ROLE_LABEL: Record<SearchableRole, string> = {
  Agronomist: 'Ingeniero agrónomo',
  Accountant: 'Contador',
  Lawyer: 'Abogado',
  Investor: 'Inversionista',
};

/** Nombre de la profesión para mostrar; `Other` (sin catálogo) queda como "Profesional". */
export const roleLabel = (role: ProfessionalRole): string =>
  ROLE_LABEL[role as SearchableRole] ?? 'Profesional';

/** Plural corto para el filtro de profesión. */
export const ROLE_FILTER_LABEL: Record<SearchableRole, string> = {
  Agronomist: 'Agrónomos',
  Accountant: 'Contadores',
  Lawyer: 'Abogados',
  Investor: 'Inversionistas',
};

export const SEARCHABLE_ROLES = Object.keys(ROLE_LABEL) as SearchableRole[];

/**
 * Regla de negocio de agent.md: la especialidad que exige presencia física filtra por zona de cobertura.
 * Un agrónomo tiene que poder llegar al campo; contador, abogado e inversionista trabajan a distancia.
 */
export const ROLE_REQUIRES_PRESENCE: Record<SearchableRole, boolean> = {
  Agronomist: true,
  Accountant: false,
  Lawyer: false,
  Investor: false,
};

/** Palabras con las que el productor nombra a cada profesional. */
export const ROLE_WORDS: Record<SearchableRole, string[]> = {
  Agronomist: ['agronom', 'ingeniero agr', 'ing agr', 'asesor tecnico'],
  Accountant: ['contador', 'contadora', 'contable'],
  Lawyer: ['abogad', 'legal', 'escribano', 'escribana'],
  Investor: ['inversor', 'inversion', 'financista', 'socio capitalista'],
};

export interface NeedTopic {
  id: string;
  label: string;
  role: SearchableRole;
  /** Prefijos de palabra (sin tildes) que delatan el tema en lo que escribe el productor o en la especialidad. */
  keywords: string[];
}

export const NEED_TOPICS: NeedTopic[] = [
  {
    id: 'extensive-crops',
    label: 'Cultivos extensivos',
    role: 'Agronomist',
    keywords: [
      'soja',
      'maiz',
      'trigo',
      'girasol',
      'siembra',
      'fertiliz',
      'maleza',
      'rinde',
      'rotacion',
      'la fina',
      'la gruesa',
      'campana agricola',
    ],
  },
  {
    id: 'precision-ag',
    label: 'Agricultura de precisión',
    role: 'Agronomist',
    keywords: [
      'precision',
      'ambientes',
      'ambientacion',
      'dosis variable',
      'satelital',
      'mapa de rinde',
    ],
  },
  {
    id: 'pastures',
    label: 'Pasturas y forraje',
    role: 'Agronomist',
    keywords: ['pastura', 'forraj', 'verdeo', 'alfalfa', 'cria', 'rodeo'],
  },
  {
    id: 'farm-taxes',
    label: 'Impuestos agropecuarios',
    role: 'Accountant',
    keywords: ['impuest', 'iva', 'ganancias', 'arca', 'afip', 'retenc', 'monotribut'],
  },
  {
    id: 'grain-settlement',
    label: 'Liquidación de granos',
    role: 'Accountant',
    keywords: ['liquidac', 'granos', 'lpg', 'cooperativa'],
  },
  {
    id: 'farm-credit',
    label: 'Créditos y garantías',
    role: 'Accountant',
    keywords: ['credito', 'prestamo', 'banco', 'garantia', 'carpeta'],
  },
  {
    id: 'farm-leases',
    label: 'Arrendamientos',
    role: 'Lawyer',
    keywords: ['arrend', 'alquil', 'aparceria', 'contrato'],
  },
  {
    id: 'succession',
    label: 'Sucesiones',
    role: 'Lawyer',
    keywords: ['sucesi', 'herenc', 'heredero'],
  },
  {
    id: 'campaign-financing',
    label: 'Financiamiento de campaña',
    role: 'Investor',
    keywords: ['financi', 'capital', 'invertir', 'inversion', 'fondos', 'socio'],
  },
];

export type Activity = 'Agricultura' | 'Ganadería' | 'Mixto' | 'Tambo';

export const ACTIVITY_WORDS: Record<Exclude<Activity, 'Mixto'>, string[]> = {
  Tambo: ['tambo', 'leche'],
  Ganadería: ['ganad', 'rodeo', 'vacas', 'novill', 'hacienda', 'invernada', 'cria'],
  Agricultura: ['soja', 'maiz', 'trigo', 'agricul', 'siembra', 'cosecha', 'girasol'],
};

export type Urgency = 'Esta semana' | 'Este mes';

export const URGENCY_WORDS: Record<Urgency, string[]> = {
  'Esta semana': ['urgente', 'esta semana', 'cuanto antes', 'ya mismo', 'manana'],
  'Este mes': ['este mes', 'proximas semanas', 'antes de la siembra'],
};

export interface ExampleNeed {
  short: string;
  full: string;
}

export const EXAMPLE_NEEDS: ExampleNeed[] = [
  {
    short: 'Contador para retenciones de granos',
    full: 'Necesito un contador que entienda de retenciones y liquidación de granos. Tengo 350 ha de soja.',
  },
  {
    short: 'Agrónomo para la fina, por ambientes',
    full: 'Busco agrónomo para planificar la fina y ajustar la fertilización por ambientes, este mes.',
  },
  {
    short: 'Revisar un contrato de arrendamiento',
    full: 'Quiero revisar un contrato de arrendamiento antes de renovarlo.',
  },
  {
    short: 'Financiar la campaña',
    full: 'Busco un inversionista que me ayude a financiar la campaña de trigo, 600 ha.',
  },
];
