/** Usuario logueado que muestra el encabezado de las pantallas autenticadas. */
export interface AppUser {
  firstName: string;
  lastName: string;
  /** Define la navegación: el productor busca y sigue solicitudes; el profesional las responde. */
  role: 'Producer' | 'Professional';
  /** ID público numérico. `null` si el backend no lo informó. */
  publicId: number | null;
  /** Foto de la cuenta (por ejemplo la de Google). Sin foto, el avatar muestra las iniciales. */
  avatarUrl?: string;
}
