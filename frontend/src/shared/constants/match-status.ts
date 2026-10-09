/** Estado del match tal como lo serializa el backend (`MatchStatus`, `JsonStringEnumConverter`). */
export type MatchStatus = 'Pending' | 'Active' | 'Rejected' | 'Cancelled' | 'Completed';

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  Pending: 'Pendiente',
  Active: 'Aceptado',
  Rejected: 'Rechazado',
  Cancelled: 'Cancelado',
  Completed: 'Completado',
};

/** Variante del `Badge` por estado: verde positivo, naranja pendiente, rojo negativo. */
export const MATCH_STATUS_BADGE: Record<MatchStatus, 'success' | 'warning' | 'destructive'> = {
  Pending: 'warning',
  Active: 'success',
  Rejected: 'destructive',
  Cancelled: 'destructive',
  Completed: 'success',
};
