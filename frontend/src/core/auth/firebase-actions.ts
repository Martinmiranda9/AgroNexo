'use client';

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type UserCredential,
} from 'firebase/auth';
import { firebaseAuth } from './firebase-client';

/**
 * Login con Firebase: a diferencia de Auth0, el SDK de cliente arma la sesión directo en la pestaña que
 * lo llama (sin popup intermedio salvo para Google, y sin ida y vuelta por redirect). Una vez que
 * Firebase confirma la identidad, mandamos su ID token a `/api/auth/session` para que el servidor lo
 * guarde en una cookie httpOnly — el resto de la app (Server Components, rutas de API) sigue leyendo la
 * sesión de ahí, igual que antes.
 */

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Iniciá sesión.',
  'auth/weak-password': 'La contraseña es muy débil.',
  'auth/invalid-email': 'Ingresá un correo válido.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en unos minutos.',
  'auth/popup-closed-by-user': 'Cerraste la ventana antes de terminar.',
  'auth/cancelled-popup-request': 'Cerraste la ventana antes de terminar.',
  'auth/network-request-failed': 'No pudimos conectarnos. Revisá tu conexión.',
};

export function firebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | undefined)?.code;
  return (code && ERROR_MESSAGES[code]) || 'Ocurrió un error al acceder. Probá de nuevo.';
}

/** Cancela el resto del flujo sin mostrar error: el usuario cerró el popup por su cuenta. */
export function isUserCancelled(err: unknown): boolean {
  const code = (err as { code?: string } | undefined)?.code;
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';
}

async function establishSession(credential: UserCredential): Promise<void> {
  const idToken = await credential.user.getIdToken();
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error('No se pudo crear la sesión.');
}

/** Abre el selector de cuenta de Google (branding "AgroNexo" según la pantalla de consentimiento de OAuth). */
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(firebaseAuth, provider);
  await establishSession(credential);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  await establishSession(credential);
}

/** Registro por correo: crea el usuario en Firebase y dispara el mail de verificación. */
export async function signUpWithEmail(email: string, password: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await sendEmailVerification(credential.user).catch(() => {});
  await establishSession(credential);
}

export async function sendPasswordReset(email: string): Promise<void> {
  // Nunca revela si el correo existe: mismo resultado en éxito o en `auth/user-not-found`.
  await sendPasswordResetEmail(firebaseAuth, email).catch((err) => {
    const code = (err as { code?: string } | undefined)?.code;
    if (code !== 'auth/user-not-found') throw err;
  });
}

export async function signOutSession(): Promise<void> {
  await Promise.all([signOut(firebaseAuth), fetch('/api/auth/session', { method: 'DELETE' })]);
}
