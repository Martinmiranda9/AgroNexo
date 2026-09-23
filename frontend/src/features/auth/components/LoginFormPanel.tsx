'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Eye, EyeOff, Loader2, Sprout, User, Lock, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// ─── Schema ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Email invalido'),
  password: z
    .string()
    .min(1, 'La contrasena es obligatoria')
    .min(6, 'Minimo 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginFormPanelProps {
  /** En este diseño, el logo siempre se muestra en el panel derecho (desktop) o arriba (mobile). */
  showLogo?: boolean;
}

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-[15px] w-[15px] shrink-0"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Field wrapper con error animado ──────────────────────────────────────────
function Field({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -3, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16 }}
            className="pl-1 text-[11px] text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function LoginFormPanel({ showLogo = true }: LoginFormPanelProps) {
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const reduce = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    console.log('Login:', data);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
  };

  // Clases input compartidas
  const inputCls = (hasError: boolean, extra = '') =>
    [
      'h-[42px] w-full rounded-xl pl-9 pr-4 text-[13px] text-stone-900',
      'border bg-white outline-none transition-all duration-200',
      'placeholder:text-stone-400',
      hasError
        ? 'border-red-300 bg-red-50/40 focus:ring-2 focus:ring-red-100/70'
        : 'border-stone-200/80 focus:border-[#0E3823]/40 focus:ring-2 focus:ring-[#0E3823]/[0.06]',
      extra,
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center"
    >
      {/* ── Logo Centrado ── */}
      {showLogo && (
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0E3823] shadow-sm">
            <Sprout className="h-6 w-6 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="mt-3 text-[21px] font-bold tracking-tight text-stone-900">
            AgroConnect
          </h2>
          <p className="mt-0.5 text-[11px] font-medium tracking-wide text-stone-400">
            Connect. Cultivate. Thrive.
          </p>
          <div className="mt-4 h-0.5 w-8 rounded-full bg-[#0E3823]/80" />
        </div>
      )}

      {/* ── Heading ── */}
      <div className="mb-6 w-full text-center">
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-stone-900">
          Bienvenido de nuevo!
        </h1>
        <p className="mt-1 text-[13px] text-stone-400">
          Ingresá a tu cuenta para continuar
        </p>
      </div>

      {/* ── Formulario ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mb-6 w-full flex flex-col gap-3">
        {/* Email */}
        <Field error={errors.email?.message}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-stone-400" strokeWidth={1.75} />
            <input
              id="email"
              type="email"
              placeholder="Correo electrónico o teléfono"
              autoComplete="email"
              className={inputCls(!!errors.email)}
              {...register('email')}
            />
          </div>
        </Field>

        {/* Password */}
        <Field error={errors.password?.message}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-stone-400" strokeWidth={1.75} />
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Contraseña"
              autoComplete="current-password"
              className={inputCls(!!errors.password, 'pr-11')}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-500"
            >
              {showPw 
                ? <EyeOff className="h-[15px] w-[15px]" strokeWidth={1.75} /> 
                : <Eye className="h-[15px] w-[15px]" strokeWidth={1.75} />}
            </button>
          </div>
        </Field>

        {/* Recordarme + Olvidaste */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer select-none items-center gap-2 text-[11px] font-medium text-stone-500">
            <input
              type="checkbox"
              className="h-3 w-3 rounded-[3px] border-stone-300/80 accent-[#0E3823]"
              {...register('rememberMe')}
            />
            Recordarme
          </label>
          <Link
            href="/forgot-password"
            className="text-[11px] font-medium text-[#0E3823] transition-colors hover:text-[#092818]"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* CTA principal */}
        <motion.button
          type="submit"
          disabled={submitting}
          whileTap={reduce ? {} : { scale: 0.985 }}
          className="
            mt-1 flex h-[42px] w-full items-center justify-center gap-2
            rounded-xl bg-[#0E3823] text-[13px] font-medium text-white
            transition-colors hover:bg-[#092818]
            disabled:opacity-60
          "
        >
          <AnimatePresence mode="wait">
            {submitting ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Iniciando...
              </motion.span>
            ) : (
              <motion.span
                key="cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                Iniciar sesión
                <ShieldCheck className="h-3.5 w-3.5 text-white/80" strokeWidth={1.75} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      {/* ── Divider ── */}
      <div className="mb-6 flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-stone-200/70" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-stone-300">
          o
        </span>
        <div className="h-px flex-1 bg-stone-200/70" />
      </div>

      {/* ── Secondary Auth Options ── */}
      <div className="mb-6 flex w-full flex-col gap-2.5">
        <motion.button
          type="button"
          whileTap={reduce ? {} : { scale: 0.985 }}
          className="
            flex h-[42px] w-full items-center justify-center gap-2.5
            rounded-xl border border-stone-200/80 bg-white
            text-[12px] font-medium text-stone-700
            transition-colors hover:bg-stone-50
          "
        >
          <GoogleIcon />
          Continuar con Google
        </motion.button>

        <motion.button
          type="button"
          whileTap={reduce ? {} : { scale: 0.985 }}
          className="
            flex h-[42px] w-full items-center justify-center gap-2.5
            rounded-xl border border-stone-200/80 bg-white
            text-[12px] font-medium text-stone-700
            transition-colors hover:bg-stone-50
          "
        >
          <Mail className="h-[15px] w-[15px] text-emerald-700" strokeWidth={1.75} />
          Continuar con Email OTP / Enlace mágico
        </motion.button>
      </div>

      {/* ── Link registro ── */}
      <p className="mb-8 text-center text-[11px] text-stone-400">
        ¿No tenés una cuenta?{' '}
        <Link href="/onboarding" className="font-semibold text-stone-800 transition-colors hover:text-stone-900">
          Registrate gratis
        </Link>
      </p>

      {/* ── Trust Badge ── */}
      <div className="flex w-full items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/60 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#EBF2ED] text-[#0E3823]">
          <Lock className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-semibold text-stone-800">
            Tus datos están protegidos
          </span>
          <span className="mt-0.5 text-[10px] leading-relaxed text-stone-400">
            Utilizamos encriptación de grado bancario para resguardar la información de tus campos y cosechas.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
