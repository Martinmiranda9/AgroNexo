import type { RegisterProducerRequest, RegisterUserResponse } from '@/core/models/producer.model';

// ─── Configuración base ───────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

// ─── Tipos de error ───────────────────────────────────────────────────────────

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

// ─── Helper interno ───────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let detail: string | undefined;
  try {
    const problem = await response.json();
    detail = problem?.detail ?? problem?.title;
  } catch {
    // respuesta sin body JSON — ignorar
  }

  // Mensajes de error en español para el usuario final
  const messages: Record<number, string> = {
    400: 'Los datos enviados no son válidos. Revisá el formulario.',
    401: 'Sesión expirada. Volvé a iniciar sesión.',
    403: 'No tenés permisos para realizar esta acción.',
    409: 'Ya existe una cuenta registrada con estos datos.',
    500: 'Ocurrió un error en el servidor. Intentá de nuevo más tarde.',
  };

  throw new ApiError(
    response.status,
    messages[response.status] ?? 'Ocurrió un error inesperado.',
    detail,
  );
}

// ─── Identity Service ─────────────────────────────────────────────────────────

/**
 * Obtiene un token JWT de desarrollo desde el backend para pruebas locales sin Auth0.
 */
export async function getDevToken(role = 'Producer', userId?: string): Promise<string> {
  const uid = userId ?? `auth0|dev_producer_${Date.now()}`;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/dev/token?role=${encodeURIComponent(role)}&userId=${encodeURIComponent(uid)}`);
    if (res.ok) {
      const data = await res.json();
      return data.accessToken ?? '';
    }
  } catch (err) {
    console.warn('No se pudo obtener el dev token:', err);
  }
  return '';
}

/**
 * Registra un nuevo productor.
 * En desarrollo, si no se proporciona token, obtiene automáticamente uno de prueba.
 */
export async function registerProducer(
  data: RegisterProducerRequest,
  token?: string,
): Promise<RegisterUserResponse> {
  let authToken = token;

  // En modo desarrollo, si no viene token de Auth0, obtenemos automáticamente uno de prueba
  if (!authToken && process.env.NODE_ENV !== 'production') {
    authToken = await getDevToken('Producer');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/identity/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse<RegisterUserResponse>(response);
}
