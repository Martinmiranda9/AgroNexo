/**
 * Origen del backend sin path. `NEXT_PUBLIC_API_URL` puede venir con o sin el sufijo `/api/v1`
 * (el .env de ejemplo lo trae); los servicios agregan `/api/v1/...` ellos mismos.
 */
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '');
