'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { Button, Field, FieldLabel, Input, Spinner } from '@/ui/components';
import BrandMark from '@/ui/components/BrandMark';
import { sendPasswordReset } from '@/core/auth/firebase-actions';

export default function ForgotPasswordForm() {
  const emailId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(undefined);
    try {
      await sendPasswordReset(email);
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
      <p className="mt-2 text-body-sm text-olive">
        Ingresá tu correo y te enviamos un enlace para elegir una contraseña nueva.
      </p>

      {status === 'sent' ? (
        <p role="status" className="mt-8 flex items-start gap-2 rounded-lg border border-olive/30 bg-olive/5 px-3.5 py-3 text-left text-body-sm">
          <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-olive" />
          Si el correo tiene una cuenta, en unos minutos te llega el enlace. Revisá también el spam.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-3.5 text-left">
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-3 text-body-sm text-danger">
              <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
          <Field>
            <FieldLabel htmlFor={emailId}>Correo</FieldLabel>
            <Input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
            {status === 'sending' && <Spinner data-icon="inline-start" />}
            Enviar enlace
          </Button>
        </form>
      )}

      <Link href="/login" className="mt-8 text-body-sm font-semibold underline underline-offset-4 hover:text-olive">
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
