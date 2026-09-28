import { AUTH_POPUP_COMPLETE_PATH, buildAuthUrl } from './config';

/**
 * Login con Google en una ventana emergente, sobre el mismo flujo de Auth0 de siempre: la cookie de
 * sesión queda en el navegador (la comparten popup y página), así que al terminar solo hay que avisarle
 * a la página principal para que recargue. Sin canje de tokens ni segunda sesión en el cliente.
 *
 * El aviso viaja por BroadcastChannel y no por `window.opener`: las pantallas de Google pueden cortar
 * la relación con la ventana que abrió el popup (Cross-Origin-Opener-Policy).
 */
const CHANNEL_NAME = 'agronexo-auth';
const POPUP_NAME = 'agronexo-google-signin';
const POPUP_SIZE = { width: 480, height: 640 };
const CLOSED_GRACE_MS = 2500;
const CLOSED_POLL_MS = 500;
const LISTEN_TIMEOUT_MS = 5 * 60 * 1000;

interface CompleteMessage {
  type: 'complete';
  /** Código de error de Auth0 (`access_denied`, `auth_failed`); ausente si salió bien. */
  error?: string;
}

const isCompleteMessage = (data: unknown): data is CompleteMessage =>
  typeof data === 'object' && data !== null && (data as { type?: unknown }).type === 'complete';

export interface GoogleSignInHandlers {
  /** El popup terminó y la sesión ya está creada. */
  onSuccess: () => void;
  /** Auth0 o Google devolvieron un error (ej: `access_denied`). */
  onError: (code: string) => void;
  /** El usuario cerró la ventana sin terminar. Puede llegar antes de un `onSuccess` tardío. */
  onCancel: () => void;
}

/** Lo llama la página final del popup para avisar a la ventana principal. */
export function notifyGoogleSignInComplete(error?: string): void {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'complete', ...(error ? { error } : {}) } satisfies CompleteMessage);
  channel.close();
}

/**
 * Abre el popup de Google. Devuelve una función que cancela la escucha.
 * Si el navegador bloquea el popup, cae a la redirección de página completa (misma cuenta, misma sesión).
 */
export function startGoogleSignIn(handlers: GoogleSignInHandlers): () => void {
  const url = buildAuthUrl({ connection: 'google', returnTo: AUTH_POPUP_COMPLETE_PATH });
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - POPUP_SIZE.width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - POPUP_SIZE.height) / 2));
  const popup =
    typeof BroadcastChannel === 'undefined'
      ? null
      : window.open(url, POPUP_NAME, `popup=yes,width=${POPUP_SIZE.width},height=${POPUP_SIZE.height},left=${left},top=${top}`);

  if (!popup) {
    window.location.assign(buildAuthUrl({ connection: 'google' }));
    return () => {};
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  let closedTimer: ReturnType<typeof setTimeout> | undefined;

  const stop = () => {
    clearInterval(poll);
    clearTimeout(closedTimer);
    clearTimeout(giveUp);
    channel.close();
  };

  channel.onmessage = (event: MessageEvent<unknown>) => {
    if (!isCompleteMessage(event.data)) return;
    stop();
    if (event.data.error) handlers.onError(event.data.error);
    else handlers.onSuccess();
  };

  // Detecta que se cerró sin terminar. `closed` puede dar `true` antes de tiempo si Google corta el
  // opener, por eso hay un margen y se sigue escuchando el aviso aunque ya se haya llamado a `onCancel`.
  const poll = setInterval(() => {
    if (!popup.closed || closedTimer) return;
    closedTimer = setTimeout(handlers.onCancel, CLOSED_GRACE_MS);
  }, CLOSED_POLL_MS);
  const giveUp = setTimeout(stop, LISTEN_TIMEOUT_MS);

  popup.focus();
  return stop;
}
