/** Datos del productor logueado que la pantalla muestra en el encabezado. */
export interface MatchDiscoveryUser {
  firstName: string;
  lastName: string;
  /** ID público numérico (prefijo 10 para productores). `null` si el backend no lo informó. */
  publicId: number | null;
}
