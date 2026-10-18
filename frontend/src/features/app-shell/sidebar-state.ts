/**
 * Cookie con la elección del sidebar (`collapsed` | `expanded`): el servidor la lee para pintar el ancho correcto.
 * Archivo aparte de `navigation.ts` para que el servidor no importe el cierre de sesión (cliente de Firebase).
 */
export const SIDEBAR_COOKIE = 'agronexo_sidebar';

export const isCollapsedValue = (value: string | undefined) => value === 'collapsed';
