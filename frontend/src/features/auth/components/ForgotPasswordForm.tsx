'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MdCheckCircle, MdErrorOutline } from 'react-icons/md';
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldLabel,
  Input,
  Spinner,
} from '@/ui/components';
import BrandMark from '@/ui/components/BrandMark';
import EmailField, { validateEmail } from '@/ui/components/EmailField';
import { sendPasswordReset } from '@/core/auth/firebase-actions';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validateEmail(email);
    setEmailError(invalid ?? undefined);
    if (invalid) return;
    setStatus('sending');
    setError(undefined);
    try {
      await sendPasswordReset(email.trim());
      setStatus('sent');
    } catch {
      setError('No pudimos enviar el correo. Probá de nuevo.');
      setStatus('idle');
    }
  };

  return (
    <div className="flex w-full max-w-[380px] flex-col items-center text-center">
      <Link
        href="/"
        className="mb-6 block h-14 w-14 rounded-xl shadow-2xs"
        aria-label="AgroNexo — Inicio"
      >
        <BrandMark variant="light" tile className="h-full w-full" />
      </Link>
      <h1 className="text-heading-lg tracking-heading">Restablecer contraseña</h1>
      <p className="text-body-sm text-muted-foreground mt-2">
        Ingresá tu correo y te enviamos un enlace para elegir una contraseña nueva.
      </p>

      {status === 'sent' ? (
        <Alert variant="success" role="status" className="mt-8 text-left">
          <MdCheckCircle aria-hidden />
          <AlertDescription>
            Si el correo tiene una cuenta, en unos minutos te llega el enlace. Revisá también el
            spam.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-3.5 text-left">
          {error && (
            <Alert variant="destructive">
              <MdErrorOutline aria-hidden />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}
          <EmailField required value={email} onChange={setEmail} error={emailError} />
          <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
            {status === 'sending' && <Spinner data-icon="inline-start" />}
            Enviar enlace
          </Button>
        </form>
      )}

      <Link
        href="/login"
        className="text-body-sm hover:text-sage-600 mt-8 font-semibold underline underline-offset-4"
      >
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
