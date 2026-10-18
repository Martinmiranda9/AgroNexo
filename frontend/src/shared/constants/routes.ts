/** Rutas de la app como constantes (plan de frontend: nunca strings sueltos). */
export const ROUTES = {
  login: '/login',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  matchDiscovery: '/match-discovery',
  matches: '/matches',
  farms: '/farms',
} as const;

/** Tablero de un campo. */
export const farmRoute = (farmId: string): string => `${ROUTES.farms}/${farmId}`;
