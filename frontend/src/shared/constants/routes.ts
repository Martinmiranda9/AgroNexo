/** Rutas de la app como constantes (plan de frontend: nunca strings sueltos). */
export const ROUTES = {
  login: '/login',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  matchDiscovery: '/match-discovery',
  matches: '/matches',
  farms: '/farms',
} as const;

/** Lista de campos con el panel de alta ya abierto (el "+" de "Mis campos" en el sidebar). */
export const NEW_FARM_ROUTE = `${ROUTES.farms}?nuevo=1`;

/** Tablero de un campo. */
export const farmRoute = (farmId: string): string => `${ROUTES.farms}/${farmId}`;
