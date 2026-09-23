"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Eye,
  EyeSlash,
  CaretDown,
  ArrowRight,
  CircleNotch,
  User,
  CalendarBlank,
  MapPin,
  Buildings,
  Briefcase,
  Ruler,
  EnvelopeSimple,
  LockSimple,
} from "@phosphor-icons/react";
import { Sprout } from "lucide-react";
import { registerProducer } from "@/core/services/identity.service";

// ─────────────────────────────────────────────────────────────────────────────
// AGROCONNECT BRAND SYSTEM — PINE & BEIGE PALETTE (60-30-10)
// Reutiliza los mismos tokens que /login (AgroConnectAuthModal):
// Canvas Beige #fef7e5 · Card Ivory #FFFBF0 · Pine #00311e · Olive #4D694E · Sage #978A56
// ─────────────────────────────────────────────────────────────────────────────

// --- Tipos ------------------------------------------------------------------

interface FormData {
  fullName: string;
  birthDate: string;
  province: string;
  establishmentName: string;
  role: string;
  hectaresRange: string;
  email: string;
  password: string;
}

// --- Constantes -------------------------------------------------------------

const PROVINCES = [
  "Buenos Aires","Catamarca","Chaco","Chubut","Córdoba","Corrientes",
  "Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza",
  "Misiones","Neuquén","Río Negro","Salta","San Juan","San Luis",
  "Santa Cruz","Santa Fe","Santiago del Estero","Tierra del Fuego","Tucumán",
];

const ROLES = [
  "Productor agropecuario",
  "Asesor técnico / Agrónomo",
  "Proveedor de insumos",
  "Inversor / Financiador",
  "Otro",
];

const HECTARES_RANGES = [
  "Hasta 50 ha","50 – 200 ha","200 – 500 ha","500 – 1.000 ha",
  "1.000 – 5.000 ha","Más de 5.000 ha","No aplica (cabezas de ganado)",
];

const TOTAL_STEPS = 3;

// --- FloatingInput (double-bezel, icono + label flotante) -------------------

function FloatingInput({
  id, label, type = "text", value, onChange, icon, autoComplete, children, disabled = false,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; icon: React.ReactNode;
  autoComplete?: string; children?: React.ReactNode; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-3.5 top-0 flex h-[52px] items-center text-[#978A56]">
        {icon}
      </div>

      <input
        id={id} type={type} value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className={[
          "h-[52px] w-full rounded-xl border bg-[#fef7e5] pb-1.5 pl-9 pt-[18px] text-[13.5px] text-[#00311e] outline-none transition-colors",
          focused && !disabled
            ? "border-[#00311e] ring-1 ring-[#00311e]/10"
            : "border-[#00311e]/15 hover:border-[#00311e]/30",
          disabled ? "cursor-not-allowed opacity-50" : "",
          children ? "pr-10" : "pr-3.5",
        ].filter(Boolean).join(" ")}
      />

      <label
        htmlFor={id}
        className={[
          "pointer-events-none absolute left-9 origin-left select-none transition-all duration-200",
          active
            ? "top-[9px] text-[10px] font-semibold uppercase tracking-wider text-[#4D694E]"
            : "top-1/2 -translate-y-1/2 text-[13.5px] text-[#978A56]",
        ].join(" ")}
      >
        {label}
      </label>

      {children && (
        <div className="absolute right-3 top-0 flex h-[52px] items-center">
          {children}
        </div>
      )}
    </div>
  );
}

// --- FloatingSelect -----------------------------------------------------------

function FloatingSelect({
  id, label, value, onChange, options, icon, disabled = false,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; options: string[]; icon: React.ReactNode; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-3.5 top-0 flex h-[52px] items-center text-[#978A56]">
        {icon}
      </div>

      <select
        id={id} value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className={[
          "h-[52px] w-full appearance-none rounded-xl border bg-[#fef7e5] pb-1.5 pl-9 pr-10 pt-[18px] text-[13.5px] outline-none transition-colors",
          focused && !disabled
            ? "border-[#00311e] ring-1 ring-[#00311e]/10"
            : "border-[#00311e]/15 hover:border-[#00311e]/30",
          value === "" ? "text-transparent" : "text-[#00311e]",
          disabled ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
      >
        <option value="" disabled hidden />
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#FFFBF0] text-[#00311e]">
            {opt}
          </option>
        ))}
      </select>

      <label
        htmlFor={id}
        className={[
          "pointer-events-none absolute left-9 origin-left select-none transition-all duration-200",
          active
            ? "top-[9px] text-[10px] font-semibold uppercase tracking-wider text-[#4D694E]"
            : "top-1/2 -translate-y-1/2 text-[13.5px] text-[#978A56]",
        ].join(" ")}
      >
        {label}
      </label>

      {active && (
        <span className="pointer-events-none absolute left-9 top-[27px] truncate pr-8 text-[13.5px] text-[#00311e]">
          {value}
        </span>
      )}

      <div className="pointer-events-none absolute right-3.5 top-0 flex h-[52px] items-center text-[#978A56]">
        <CaretDown size={14} weight="bold" />
      </div>
    </div>
  );
}

// --- ProgressBar --------------------------------------------------------------
// Montado UNA sola vez fuera del bloque animado por paso: cada segmento anima
// solo su propio ancho al cambiar `currentStep`, en vez de re-montarse y
// re-disparar la animación de las tres barras juntas.

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div
      className="flex w-full gap-1.5"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
    >
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const filled = i < currentStep;
        return (
          <div key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-[#00311e]/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[#00311e]"
              animate={{ width: filled ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        );
      })}
    </div>
  );
}

// --- Ilustraciones SVG — trazos olive (#4D694E) sobre card ivory ------------

function IllustrationStep1() {
  return (
    <svg viewBox="0 0 280 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <path d="M0 150 Q70 128 140 143 Q210 158 280 138 L280 210 L0 210 Z" fill="#4D694E" fillOpacity="0.07" />
      <path d="M0 168 Q70 148 140 163 Q210 178 280 160 L280 210 L0 210 Z" fill="#4D694E" fillOpacity="0.11" />
      <path d="M0 185 Q70 168 140 180 Q210 194 280 178 L280 210 L0 210 Z" fill="#4D694E" fillOpacity="0.17" />

      <line x1="18" y1="108" x2="262" y2="108" stroke="#4D694E" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="18" y1="94" x2="262" y2="94" stroke="#4D694E" strokeWidth="0.6" strokeOpacity="0.2" />
      <line x1="18" y1="82" x2="262" y2="82" stroke="#4D694E" strokeWidth="0.5" strokeOpacity="0.13" />

      {[32,62,94,126,158,188,218,248].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${138 + (i % 3) * 9})`}>
          <line x1="0" y1="0" x2="0" y2="32" stroke="#4D694E" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.85" />
          <ellipse cx="0" cy="-7" rx="3.5" ry="10" fill="#4D694E" fillOpacity="0.8" />
          <ellipse cx="-4.5" cy="-1" rx="2.5" ry="7" fill="#4D694E" fillOpacity="0.65" transform="rotate(-22)" />
          <ellipse cx="4.5" cy="-1" rx="2.5" ry="7" fill="#4D694E" fillOpacity="0.65" transform="rotate(22)" />
        </g>
      ))}

      <circle cx="168" cy="114" r="5" fill="#4D694E" />
      <circle cx="168" cy="114" r="12" fill="#4D694E" fillOpacity="0.2" />
      <circle cx="168" cy="114" r="20" fill="#4D694E" fillOpacity="0.08" />
    </svg>
  );
}

function IllustrationStep2() {
  return (
    <svg viewBox="0 0 280 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <path d="M18 172 Q84 140 140 155 Q196 170 262 148" stroke="#4D694E" strokeWidth="1.5" strokeOpacity="0.5" fill="none" strokeLinecap="round" />
      <path d="M18 150 Q82 116 140 130 Q198 144 262 122" stroke="#4D694E" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
      <path d="M26 128 Q84 96 140 108 Q196 120 256 98" stroke="#4D694E" strokeWidth="1.0" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
      <path d="M36 108 Q86 78 140 88 Q194 98 252 78" stroke="#4D694E" strokeWidth="0.9" strokeOpacity="0.22" fill="none" strokeLinecap="round" />
      <path d="M50 88 Q90 62 140 70 Q190 78 248 60" stroke="#4D694E" strokeWidth="0.8" strokeOpacity="0.16" fill="none" strokeLinecap="round" />
      <path d="M68 70 Q102 48 140 54 Q178 60 240 44" stroke="#4D694E" strokeWidth="0.7" strokeOpacity="0.11" fill="none" strokeLinecap="round" />

      <g transform="translate(118, 62)">
        <rect x="-12" y="10" width="24" height="26" rx="2" fill="#FFFBF0" stroke="#00311e" strokeWidth="1.4" />
        <polygon points="-16,10 0,-6 16,10" fill="#E6F0E6" stroke="#00311e" strokeWidth="1.4" />
        <rect x="-5" y="20" width="10" height="16" rx="1" fill="#00311e" fillOpacity="0.7" />
        <rect x="18" y="14" width="12" height="22" rx="3" fill="#FFFBF0" stroke="#00311e" strokeWidth="1.4" />
        <path d="M18 14 Q24 7 30 14" fill="#E6F0E6" stroke="#00311e" strokeWidth="1.2" />
      </g>

      <circle cx="140" cy="64" r="4.5" fill="#4D694E" />
      <circle cx="140" cy="64" r="10" fill="#4D694E" fillOpacity="0.2" />
      <circle cx="140" cy="64" r="18" fill="#4D694E" fillOpacity="0.08" />
    </svg>
  );
}

function IllustrationStep3() {
  const nodes = [
    { cx: 140, cy: 72, r: 6, main: true },
    { cx: 88, cy: 114, r: 4, main: false },
    { cx: 192, cy: 114, r: 4, main: false },
    { cx: 64, cy: 158, r: 3.2, main: false },
    { cx: 116, cy: 152, r: 3.2, main: false },
    { cx: 166, cy: 152, r: 3.2, main: false },
    { cx: 212, cy: 155, r: 3.2, main: false },
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];

  return (
    <svg viewBox="0 0 280 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <path d="M140 22 L178 38 L178 76 Q178 108 140 124 Q102 108 102 76 L102 38 Z" fill="#4D694E" fillOpacity="0.07" stroke="#4D694E" strokeWidth="1.2" />
      <path d="M140 30 L170 44 L170 76 Q170 102 140 116 Q110 102 110 76 L110 44 Z" fill="#4D694E" fillOpacity="0.1" />

      <rect x="127" y="62" width="26" height="20" rx="4" fill="#FFFBF0" stroke="#00311e" strokeWidth="1.2" />
      <path d="M130 62 L130 55 Q130 44 140 44 Q150 44 150 55 L150 62" stroke="#00311e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="140" cy="72" r="3.5" fill="#00311e" fillOpacity="0.65" />

      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].cx} y1={nodes[a].cy} x2={nodes[b].cx} y2={nodes[b].cy}
          stroke="#4D694E" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="4 3" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r={n.r + 4} fill="#4D694E" fillOpacity={n.main ? 0.2 : 0.1} />
          <circle cx={n.cx} cy={n.cy} r={n.r} fill="#4D694E" />
        </g>
      ))}
    </svg>
  );
}

// --- Panel visual derecho — misma familia de color que el resto (beige) -----

function VisualPanel({ step }: { step: number }) {
  const reduce = useReducedMotion();

  const captions = [
    "Cada productor que se registra hace la red más fuerte. Tu perfil conecta tu campo con los mejores profesionales del agro.",
    "Tu escala define cómo te conectamos. Desde el pequeño productor familiar hasta las grandes explotaciones agropecuarias.",
    "Tu cuenta está protegida con cifrado de extremo a extremo. Solo vos y tu equipo acceden a la información de tu campo.",
  ];
  const illustrations = [
    <IllustrationStep1 key="s1" />,
    <IllustrationStep2 key="s2" />,
    <IllustrationStep3 key="s3" />,
  ];

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-12 py-16 xl:px-16">
      {/* Anillos concéntricos — mismo motivo "sensor de campo" de /login */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[560px] w-[560px] rounded-full border border-[#00311e]/[0.05]" />
        <div className="absolute inset-[65px] rounded-full border border-[#00311e]/[0.06]" />
        <div className="absolute inset-[130px] rounded-full border border-[#00311e]/[0.08]" />
      </div>

      <div className="relative flex w-full max-w-[340px] flex-col items-center gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.97 }}
            transition={{ duration: 0.38, ease: "easeInOut" }}
            className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#00311e]/10 bg-[#FFFBF0] shadow-2xs"
          >
            {illustrations[step - 1]}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`caption-${step}`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center text-[13px] leading-[1.75] text-[#4D694E]"
          >
            {captions[step - 1]}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`block h-1 rounded-full transition-all duration-300 ${
                i + 1 === step ? "w-5 bg-[#00311e]" : "w-1.5 bg-[#978A56]/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Pasos ------------------------------------------------------------------

function StepOne({ data, onChange, isLoading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; isLoading: boolean }) {
  return (
    <div className="flex flex-col gap-3.5">
      <FloatingInput id="fullName" label="Nombre completo" value={data.fullName} disabled={isLoading}
        onChange={(v) => onChange("fullName", v)} autoComplete="name"
        icon={<User className="h-4 w-4" weight="regular" />} />
      <FloatingInput id="birthDate" label="Fecha de nacimiento" type="date" disabled={isLoading}
        value={data.birthDate} onChange={(v) => onChange("birthDate", v)} autoComplete="bday"
        icon={<CalendarBlank className="h-4 w-4" weight="regular" />} />
      <FloatingSelect id="province" label="Ubicación / Provincia" value={data.province} disabled={isLoading}
        onChange={(v) => onChange("province", v)} options={PROVINCES}
        icon={<MapPin className="h-4 w-4" weight="regular" />} />
    </div>
  );
}

function StepTwo({ data, onChange, isLoading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; isLoading: boolean }) {
  return (
    <div className="flex flex-col gap-3.5">
      <FloatingInput id="establishmentName" label="Nombre del establecimiento o empresa" disabled={isLoading}
        value={data.establishmentName} onChange={(v) => onChange("establishmentName", v)} autoComplete="organization"
        icon={<Buildings className="h-4 w-4" weight="regular" />} />
      <FloatingSelect id="role" label="Rol principal" value={data.role} disabled={isLoading}
        onChange={(v) => onChange("role", v)} options={ROLES}
        icon={<Briefcase className="h-4 w-4" weight="regular" />} />
      <FloatingSelect id="hectaresRange" label="Hectáreas / Cabezas estimadas" disabled={isLoading}
        value={data.hectaresRange} onChange={(v) => onChange("hectaresRange", v)} options={HECTARES_RANGES}
        icon={<Ruler className="h-4 w-4" weight="regular" />} />
    </div>
  );
}

function StepThree({ data, onChange, isLoading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; isLoading: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex flex-col gap-3.5">
      <FloatingInput id="email" label="Correo electrónico" type="email" value={data.email} disabled={isLoading}
        onChange={(v) => onChange("email", v)} autoComplete="email"
        icon={<EnvelopeSimple className="h-4 w-4" weight="regular" />} />
      <FloatingInput id="password" label="Contraseña" type={showPassword ? "text" : "password"} disabled={isLoading}
        value={data.password} onChange={(v) => onChange("password", v)} autoComplete="new-password"
        icon={<LockSimple className="h-4 w-4" weight="regular" />}>
        <button type="button" onClick={() => setShowPassword((s) => !s)} disabled={isLoading}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="text-[#978A56] transition-colors hover:text-[#00311e] focus:outline-none">
          {showPassword ? <EyeSlash className="h-4 w-4" weight="regular" /> : <Eye className="h-4 w-4" weight="regular" />}
        </button>
      </FloatingInput>
      <p className="text-[12px] leading-relaxed text-[#4D694E]">
        Al registrarte aceptás los{" "}
        <a href="#" className="text-[#00311e] underline underline-offset-2 transition-colors hover:text-[#4D694E]">
          Términos y Condiciones
        </a>{" "}
        y la{" "}
        <a href="#" className="text-[#00311e] underline underline-offset-2 transition-colors hover:text-[#4D694E]">
          Política de Privacidad
        </a>
        .
      </p>
    </div>
  );
}

// --- Componente principal ---------------------------------------------------

const STEP_META = [
  {
    headline: "Detrás de cada campo\nhay un productor",
    subtitle: "Antes de comenzar, queremos conocerte un poco mejor.",
  },
  {
    headline: "Contanos sobre\ntu actividad",
    subtitle: "Personalizaremos tu experiencia según tu escala.",
  },
  {
    headline: "Asegurá\ntu cuenta",
    subtitle: "Tu punto de acceso a la red AgroConnect.",
  },
];

export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const [formData, setFormData] = useState<FormData>({
    fullName: "", birthDate: "", province: "",
    establishmentName: "", role: "", hectaresRange: "",
    email: "", password: "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg(null);
  };

  const goNext = async () => {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep((s) => s + 1);
      return;
    }

    // --- Envío final al backend ---
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const parts = formData.fullName.trim().split(" ");
      const firstName = parts[0] || "Productor";
      const lastName = parts.slice(1).join(" ") || "Sin Apellido";

      const res = await registerProducer({
        userType: 1,
        firstName,
        lastName,
        province: formData.province,
      });

      console.log("¡Registro exitoso!", res);
      alert(`¡Cuenta de productor creada con éxito!\n\nID Público: #${res.publicId}\nNombre: ${res.firstName} ${res.lastName}\nWorkspace: ${res.tenantName}`);

    } catch (err: any) {
      console.error("Error al registrar:", err);
      setErrorMsg(err.message || "Ocurrió un error al crear la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1 && !isLoading) {
      setDirection(-1);
      setStep((s) => s - 1);
      setErrorMsg(null);
    }
  };

  const meta = STEP_META[step - 1];
  const isLastStep = step === TOTAL_STEPS;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -24 : 24, opacity: 0 }),
  };

  return (
    /* Canvas único (misma familia beige que /login), sin división de color entre paneles */
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#fef7e5] text-[#00311e] md:flex-row">

      {/* ── Columna izquierda: acceso — todo centrado ── */}
      <div className="flex w-full flex-col items-center justify-center border-b border-[#00311e]/10 px-6 py-12 sm:px-10 md:w-1/2 md:border-b-0 md:border-r md:px-16 lg:px-20">
        <div className="flex w-full max-w-[400px] flex-col items-center">

          {/* Logo — mismo componente que /login */}
          <Link
            href="/"
            className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00311e]/15 bg-[#FFFBF0] shadow-2xs transition-colors hover:border-[#00311e]/35"
            aria-label="AgroConnect — Inicio"
          >
            <Sprout className="h-7 w-7 text-[#4D694E]" strokeWidth={1.75} />
          </Link>

          {/* Titular + subtítulo centrados, animados por paso */}
          <div className="relative w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`heading-${step}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                className="flex w-full flex-col items-center text-center"
              >
                <h1 className="whitespace-pre-line text-[26px] font-bold leading-[1.2] tracking-tight text-[#00311e] sm:text-[30px]">
                  {meta.headline}
                </h1>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#4D694E]">
                  {meta.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progreso — montado una vez, no se re-dispara entero por paso */}
          <div className="mt-8 w-full">
            <ProgressBar currentStep={step} />
          </div>

          {errorMsg && (
            <div className="mt-6 w-full rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Campos animados por paso */}
          <div className="relative mt-8 w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`fields-${step}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                className="w-full text-left"
              >
                {step === 1 && <StepOne data={formData} onChange={handleChange} isLoading={isLoading} />}
                {step === 2 && <StepTwo data={formData} onChange={handleChange} isLoading={isLoading} />}
                {step === 3 && <StepThree data={formData} onChange={handleChange} isLoading={isLoading} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Botones — mismo estilo que la CTA de /login */}
          <div className="mt-8 flex w-full gap-3">
            {step > 1 && (
              <motion.button
                type="button" onClick={goBack} disabled={isLoading}
                whileTap={reduce ? {} : { scale: 0.985 }}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#00311e]/20 bg-[#fef7e5] text-[13.5px] font-medium text-[#00311e] shadow-2xs transition-all hover:border-[#00311e]/35 hover:bg-[#f5ead4] disabled:opacity-50"
              >
                Volver
              </motion.button>
            )}

            <motion.button
              type="button" onClick={goNext} disabled={isLoading}
              whileTap={reduce ? {} : { scale: 0.985 }}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#00311e] text-[13.5px] font-medium text-[#fef7e5] shadow-sm transition-all hover:bg-[#002617] disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                  Creando cuenta...
                </span>
              ) : isLastStep ? (
                <>
                  Crear cuenta
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fef7e5]/15">
                    <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                  </span>
                </>
              ) : (
                "Continuar"
              )}
            </motion.button>
          </div>

          {/* Footer — enlace a login, coherente con el footer de /login */}
          <p className="mt-8 text-center text-[12.5px] text-[#4D694E]">
            ¿Ya tenés una cuenta?{" "}
            <Link href="/login" className="font-semibold text-[#00311e] underline underline-offset-4 transition-colors hover:text-[#4D694E]">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      {/* ── Columna derecha: ilustración — misma familia beige, sin salto de color ── */}
      <div className="hidden md:block md:w-1/2">
        <VisualPanel step={step} />
      </div>
    </div>
  );
}
