'use client';

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Eye,
  EyeSlash,
  ArrowRight,
  CircleNotch,
  EnvelopeSimple,
  LockSimple,
} from '@phosphor-icons/react';
import { Sprout } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// AGROCONNECT BRAND SYSTEM — PINE & BEIGE PALETTE (60-30-10)
// 60% Canvas & Surfaces: Beige (#fef7e5) & Card Ivory (#FFFBF0)
// 30% Structure & High Contrast Text: Pine (#00311e) → máximo contraste sobre Beige
// 10% Accents & Details: Olive (#4D694E) & Sage (#728141)
// ─────────────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
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

// ─── Input con label flotante (double-bezel, sin placeholder-as-label) ────────
interface FloatingFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
  autoComplete?: string;
}

function FloatingField({ label, type, value, onChange, icon, rightSlot, autoComplete }: FloatingFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-0 flex h-full items-center text-[#978A56]">
        {icon}
      </div>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="h-[52px] w-full rounded-xl border border-[#00311e]/15 bg-[#fef7e5] pb-1.5 pl-9 pr-10 pt-[18px] text-[13.5px] text-[#00311e] outline-none transition-colors focus:border-[#00311e] focus:ring-1 focus:ring-[#00311e]/10"
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-9 origin-left transition-all duration-200 ${
          active
            ? 'top-[9px] text-[10px] font-semibold uppercase tracking-wider text-[#4D694E]'
            : 'top-1/2 -translate-y-1/2 text-[13.5px] text-[#978A56]'
        }`}
      >
        {label}
      </label>
      {rightSlot && <div className="absolute right-3 top-0 flex h-full items-center">{rightSlot}</div>}
    </div>
  );
}

const BRAND_SLIDES = [
  {
    title: 'Trazabilidad de campo',
    description: 'Registrá labores, insumos y rindes por lote, todo en un mismo lugar.',
  },
  {
    title: 'Match con profesionales',
    description: 'Conectá tu establecimiento con agrónomos, contadores e inversores verificados.',
  },
  {
    title: 'Decisiones con datos',
    description: 'Visualizá el estado de tus campos y actuá con información real, no supuestos.',
  },
];

export default function AgroConnectAuthModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'quick' | 'credentials'>('quick');
  const [activeSlide, setActiveSlide] = useState(0);

  const reduce = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BRAND_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col md:flex-row bg-[#FFFBF0] text-[#00311e]">
      {/* ══════════════════════════════════════════════════════════════════════
          PANEL IZQUIERDO — Acceso (46% desktop / 100% mobile)
          Fondo Card Ivory (#FFFBF0)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="flex w-full flex-col justify-center border-b border-[#00311e]/10 p-8 sm:p-12 md:w-[46%] md:border-b-0 md:border-r md:p-14 lg:p-20">
        {/* Contenedor central de acceso */}
        <div className="mx-auto w-full max-w-[360px] py-12 text-center md:py-8">
          <div className="mb-8 flex flex-col items-center">
            <Link
              href="/"
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00311e]/15 bg-[#fef7e5] shadow-2xs transition-colors hover:border-[#00311e]/35"
              aria-label="AgroConnect — Inicio"
            >
              <Sprout className="h-7 w-7 text-[#4D694E]" strokeWidth={1.75} />
            </Link>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[#00311e] sm:text-[28px]">
              {mode === 'quick' ? 'Bienvenido a AgroConnect' : 'Acceso con contraseña'}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[#4D694E]">
              {mode === 'quick'
                ? 'Iniciá sesión para gestionar tus establecimientos y asesoramientos.'
                : 'Ingresá tu correo electrónico y contraseña registrados.'}
            </p>
          </div>

          {/* Botones de acceso rápido */}
          {mode === 'quick' && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setMode('credentials')}
                className="group relative flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#00311e] text-[13.5px] font-medium text-[#fef7e5] shadow-sm transition-colors hover:bg-[#002617] active:scale-[0.985] cursor-pointer"
              >
                <span className="relative z-10">Continuar con email</span>
                <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#fef7e5]/15 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-[#fef7e5]/25">
                  <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                </span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              <a
                href="/api/auth/login?connection=google-oauth2"
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#00311e]/20 bg-[#fef7e5] text-[13.5px] font-medium text-[#00311e] shadow-2xs transition-all hover:border-[#00311e]/35 hover:bg-[#f5ead4] active:scale-[0.985]"
              >
                <GoogleIcon />
                <span>Continuar con Google</span>
              </a>
            </div>
          )}

          {/* Formulario de credenciales */}
          <AnimatePresence mode="wait">
            {mode === 'credentials' && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-3.5 text-left">
                  <FloatingField
                    label="Correo electrónico"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    icon={<EnvelopeSimple className="h-4 w-4" weight="regular" />}
                  />

                  <FloatingField
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                    icon={<LockSimple className="h-4 w-4" weight="regular" />}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-[#978A56] transition-colors hover:text-[#00311e] cursor-pointer"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#4D694E]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-[#00311e]/30 accent-[#00311e]"
                      />
                      Recordar este equipo
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-[11.5px] font-medium text-[#4D694E] transition-colors hover:text-[#00311e]"
                    >
                      ¿Olvidaste tu clave?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00311e] text-[13.5px] font-medium text-[#fef7e5] shadow-sm transition-all hover:bg-[#002617] active:scale-[0.985] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                        Iniciando sesión...
                      </span>
                    ) : (
                      'Entrar al sistema'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('quick')}
                    className="mt-1 text-center text-[11.5px] text-[#4D694E] transition-colors hover:text-[#00311e] cursor-pointer"
                  >
                    Volver a opciones rápidas
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aviso legal */}
          <p className="mt-8 text-center text-[11px] leading-relaxed text-[#978A56]">
            Al continuar aceptás la{' '}
            <Link href="/privacy" className="text-[#4D694E] underline underline-offset-2 transition-colors hover:text-[#00311e]">
              Política de Privacidad
            </Link>{' '}
            y los{' '}
            <Link href="/terms" className="text-[#4D694E] underline underline-offset-2 transition-colors hover:text-[#00311e]">
              Términos de Servicio
            </Link>
            .
          </p>
        </div>

        {/* Footer / Enlace a registro */}
        <footer className="border-t border-[#00311e]/10 pt-4 text-center">
          <p className="text-[12.5px] text-[#4D694E]">
            ¿No tenés una cuenta?{' '}
            <Link
              href="/onboarding"
              className="font-semibold text-[#00311e] underline underline-offset-4 transition-colors hover:text-[#4D694E]"
            >
              Registrate como productor o profesional
            </Link>
          </p>
        </footer>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL DERECHO — Showcase de marca (54% desktop)
          Fondo Beige → Beige-deeper con el isotipo 3D flotando (sin fotografía)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative hidden md:flex md:w-[54%] flex-col items-center justify-center overflow-hidden rounded-l-[2.5rem] bg-gradient-to-b from-[#FFF3D5] to-[#ede0c4] p-12 xl:p-16 xl:rounded-l-[3.5rem]">
        {/* Anillos concéntricos — motivo sutil "sensor de campo" */}
        <div className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
          <div className="h-[620px] w-[620px] rounded-full border border-[#00311e]/[0.05]" />
          <div className="absolute inset-[70px] rounded-full border border-[#00311e]/[0.06]" />
          <div className="absolute inset-[140px] rounded-full border border-[#00311e]/[0.08]" />
        </div>

        {/* Halo cálido detrás del objeto */}
        <div className="pointer-events-none absolute left-1/2 top-[40%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#99A474]/20 blur-[100px]" />

        {/* Grano sutil — le da textura al fondo plano */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Borde interior — remate double-bezel contra el formulario */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/50" />

        <div className="relative flex flex-col items-center text-center">
          {/* Isotipo 3D flotante */}
          <motion.div
            animate={reduce ? {} : { y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-[300px] w-[300px] sm:h-[340px] sm:w-[340px] xl:h-[400px] xl:w-[400px]"
          >
            <Image
              src="/agro-3d-icon.png"
              alt="Isotipo AgroConnect en render 3D"
              fill
              className="object-contain"
              sizes="400px"
              priority
            />
          </motion.div>

          {/* Textos del pilar de valor en transición */}
          <div className="mt-4 min-h-[96px] max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                <h2 className="text-[20px] font-semibold tracking-tight text-[#00311e]">
                  {BRAND_SLIDES[activeSlide].title}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#4D694E]">
                  {BRAND_SLIDES[activeSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Paginador minimalista */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {BRAND_SLIDES.map((_, index) => {
              const isActive = index === activeSlide;
              return (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className="group cursor-pointer p-1"
                  aria-label={`Ir a pilar ${index + 1}`}
                >
                  <span
                    className={`block h-1 rounded-full transition-all duration-300 ${
                      isActive ? 'w-5 bg-[#00311e]' : 'w-1.5 bg-[#978A56]/40 group-hover:bg-[#4D694E]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
