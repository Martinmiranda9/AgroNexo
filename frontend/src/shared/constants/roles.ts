/** Profesiones con catálogo. Coincide con `SearchableRole` de `core/models` (shared no importa de core). */
type RoleKey = 'Agronomist' | 'Accountant' | 'Lawyer' | 'Investor';

/** Nombre de cada profesión para mostrar. */
export const PROFESSIONAL_ROLE_LABEL: Record<RoleKey, string> = {
  Agronomist: 'Ingeniero agrónomo',
  Accountant: 'Contador',
  Lawyer: 'Abogado',
  Investor: 'Inversionista',
};

/** Plural corto para los filtros por profesión. */
export const PROFESSIONAL_ROLE_FILTER_LABEL: Record<RoleKey, string> = {
  Agronomist: 'Agrónomos',
  Accountant: 'Contadores',
  Lawyer: 'Abogados',
  Investor: 'Inversionistas',
};

/** Nombre de la profesión; las que no tienen catálogo (`Other`) quedan como "Profesional". */
export const professionalRoleLabel = (role: string): string =>
  PROFESSIONAL_ROLE_LABEL[role as RoleKey] ?? 'Profesional';
