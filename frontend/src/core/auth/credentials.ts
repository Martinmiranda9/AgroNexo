import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Ingresá un correo válido.').max(254),
  password: z.string().min(1, 'Ingresá tu contraseña.').max(128),
});

export const emailSchema = credentialsSchema.pick({ email: true });

/** Primera IP de `x-forwarded-for`, para que Auth0 limite intentos por usuario e IP. */
export function clientIpFrom(req: Request): string | undefined {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
}
