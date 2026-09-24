import type { RegisterUserRequest, RegisterUserResponse } from '@/core/models/identity.model';
import { USER_TYPE } from '@/core/models/identity.model';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revisá el formulario.',
  401: 'Sesión expirada. Volvé a iniciar sesión.',
  403: 'No tenés permisos para realizar esta acción.',
  409: 'Ya existe una cuenta registrada con estos datos.',
  500: 'Ocurrió un error en el servidor. Intentá de nuevo más tarde.',
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;

  let detail: string | undefined;
  try {
    const problem = await response.json();
    const fieldErrors = problem?.errors ? Object.values<string[]>(problem.errors).flat() : [];
    detail = fieldErrors[0] ?? problem?.detail ?? problem?.title;
  } catch {
    // respuesta sin body JSON
  }

  throw new ApiError(response.status, STATUS_MESSAGES[response.status] ?? 'Ocurrió un error inesperado.', detail);
}

/** Token JWT de desarrollo (solo entornos no productivos, hasta integrar Auth0). */
export async function getDevToken(role: 'Producer' | 'Professional', userId: string): Promise<string> {
  const query = new URLSearchParams({ role, userId });
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/dev/token?${query}`);
    if (res.ok) return (await res.json()).accessToken ?? '';
  } catch (err) {
    console.warn('No se pudo obtener el dev token:', err);
  }
  return '';
}

/**
 * Registra un productor o profesional. En desarrollo, sin token de Auth0,
 * pide uno de prueba con un usuario único por registro.
 */
export async function registerUser(data: RegisterUserRequest, token?: string): Promise<RegisterUserResponse> {
  let authToken = token;

  if (!authToken && process.env.NODE_ENV !== 'production') {
    const role = data.userType === USER_TYPE.Producer ? 'Producer' : 'Professional';
    authToken = await getDevToken(role, `auth0|dev_${role.toLowerCase()}_${crypto.randomUUID()}`);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/identity/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(data),
  });

  return handleResponse<RegisterUserResponse>(response);
}
