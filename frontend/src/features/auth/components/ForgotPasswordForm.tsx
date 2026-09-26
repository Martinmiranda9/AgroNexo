'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import BrandMark from '@/ui/components/BrandMark';

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
      const res = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setError(body.message ?? 'No pudimos enviar el correo. Probá de nuevo.');
        setStatus('idle');
        return;
      }
      setStatus('sent');
    } catch {
      setError('No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.');
      setStatus('idle');
    }
  };

  return (
    <div className="flex w-full max-w-[380px] flex-col items-center text-center">
      <Link
        href="/"
        className="mb-6 block h-14 w-14 rounded-2xl shadow-2xs"
        aria-label="AgroNexo — Inicio"
      >
        <BrandMark variant="light" tile className="h-full w-full" />
      </Link>
      <h1 className="text-heading-lg tracking-heading">Restablecer contraseña</h1>
      <p className="mt-2 text-body-sm text-[#4D694E]">
        Ingresá tu correo y te enviamos un enlace para elegir una contraseña nueva.
      </p>

      {status === 'sent' ? (
        <p role="status" className="mt-8 flex items-start gap-2 rounded-xl border border-[#4D694E]/30 bg-[#4D694E]/5 px-3.5 py-3 text-left text-body-sm">
          <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-[#4D694E]" />
          Si el correo tiene una cuenta, en unos minutos te llega el enlace. Revisá también el spam.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-3.5 text-left">
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#8C4A34]/30 bg-[#8C4A34]/5 px-3.5 py-3 text-body-sm text-[#8C4A34]">
              <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
          <label htmlFor={emailId} className="text-body-sm font-medium">
            Correo
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-[#00311e]/15 bg-[#fef7e5] px-4 text-body-sm outline-none transition-colors placeholder:text-[#978A56] focus:border-[#00311e] focus:ring-1 focus:ring-[#00311e]/10"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#00311e] text-body-sm font-medium text-[#fef7e5] shadow-sm transition-all hover:bg-[#002617] active:scale-[0.985] disabled:opacity-60"
          >
            {status === 'sending' ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" aria-label="Enviando" /> : 'Enviar enlace'}
          </button>
        </form>
      )}

      <Link href="/login" className="mt-8 text-body-sm font-semibold underline underline-offset-4 hover:text-[#4D694E]">
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
