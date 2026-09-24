import { parseMulti } from '../lib/values';
import type {
  FieldDef,
  FormValues,
  PreviewData,
  RegistrationFlow,
  RegistrationKind,
  StepDef,
} from './types';

const DEFAULT_LOCATION: FormValues = { country: 'Argentina', countryCode: 'AR', province: '', provinceCode: '', city: '' };

export const PROFESSIONAL_ROLE: Record<Exclude<RegistrationKind, 'producer'>, 'Agronomist' | 'Accountant' | 'Lawyer' | 'Investor'> = {
  agronomist: 'Agronomist',
  accountant: 'Accountant',
  lawyer: 'Lawyer',
  investor: 'Investor',
};

const PRODUCER_TYPES = [
  { value: 'Agricola', label: 'Agrícola', description: 'Cultivos extensivos: cereales y oleaginosas.' },
  { value: 'Ganadero', label: 'Ganadero', description: 'Cría, recría o engorde bovino.' },
  { value: 'Mixto', label: 'Mixto', description: 'Agricultura y ganadería con rotación.' },
];

const HECTARES_RANGES = [
  { value: 'Up100', label: 'Hasta 100 ha' },
  { value: 'From100To500', label: '100 a 500 ha' },
  { value: 'From500To1000', label: '500 a 1.000 ha' },
  { value: 'From1000To5000', label: '1.000 a 5.000 ha' },
  { value: 'Over5000', label: 'Más de 5.000 ha' },
];

const LOOKING_FOR = [
  { value: 'Agronomist', label: 'Agrónomo' },
  { value: 'Accountant', label: 'Contador' },
  { value: 'Lawyer', label: 'Abogado' },
  { value: 'Investor', label: 'Inversionista' },
];

const COVERAGE_RADIUS = ['25', '50', '100', '200', '500'].map((km) => ({ value: km, label: `${km} km a la redonda` }));

const personalFields: FieldDef[] = [
  { kind: 'text', name: 'firstName', label: 'Nombre', placeholder: 'Ej: Martín', required: true, maxLength: 100, autoComplete: 'given-name' },
  { kind: 'text', name: 'lastName', label: 'Apellido', placeholder: 'Ej: Miranda', required: true, maxLength: 100, autoComplete: 'family-name' },
  { kind: 'text', name: 'documentNumber', label: 'DNI o CUIT', placeholder: 'Sin puntos ni espacios', required: true, maxLength: 50, format: 'document' },
  {
    kind: 'text',
    name: 'phoneNumber',
    label: 'WhatsApp',
    placeholder: '+54 9 351 123 4567',
    required: true,
    maxLength: 25,
    format: 'phone',
    inputMode: 'tel',
    autoComplete: 'tel',
    hint: 'Con código de país. Por acá te avisamos de tus conexiones.',
  },
];

const fullName = (v: FormValues) => [v.firstName, v.lastName].filter(Boolean).join(' ') || undefined;
const place = (v: FormValues) => [v.city, v.province, v.country].filter(Boolean).join(', ') || undefined;

// ─── Productor ────────────────────────────────────────────────────────────────

const producerSteps: StepDef[] = [
  {
    id: 'personal',
    title: 'Detrás de cada campo hay una persona',
    subtitle: 'Antes de empezar, contanos un poco más sobre vos.',
    aside: 'Cada productor de AgroNexo tiene un perfil propio. Así los profesionales saben con quién van a trabajar.',
    fields: personalFields,
  },
  {
    id: 'location',
    title: '¿Dónde está tu establecimiento?',
    subtitle: 'Usamos tu ubicación para conectarte con profesionales de tu zona.',
    aside: 'Los profesionales que trabajan cerca de tu campo aparecen primero en tus recomendaciones.',
    fields: [{ kind: 'location', levels: ['country', 'province', 'city'], required: true }],
  },
  {
    id: 'activity',
    title: '¿Qué producís?',
    subtitle: 'Elegí tu actividad principal. Podés sumar más después.',
    aside: 'Tu actividad nos ayuda a sugerirte agrónomos, contadores y abogados con experiencia en tu rubro.',
    fields: [
      { kind: 'choice', name: 'producerType', label: 'Actividad principal', required: true, options: PRODUCER_TYPES },
      { kind: 'select', name: 'hectaresRange', label: 'Superficie total', placeholder: 'Elegí un rango', required: true, options: HECTARES_RANGES },
    ],
  },
  {
    id: 'looking-for',
    title: '¿Qué profesionales necesitás?',
    subtitle: 'Elegí uno o varios. Te mostramos primero a quienes trabajan en tu zona.',
    aside: 'Con esto armamos tus recomendaciones. Podés cambiarlo cuando quieras.',
    fields: [{ kind: 'choice', name: 'lookingFor', label: 'Estoy buscando', multiple: true, required: true, options: LOOKING_FOR }],
  },
];

function producerPreview(v: FormValues, step: number): PreviewData {
  const type = PRODUCER_TYPES.find((t) => t.value === v.producerType)?.label;
  const hectares = HECTARES_RANGES.find((h) => h.value === v.hectaresRange)?.label;
  const wanted = parseMulti(v.lookingFor);
  const wantedLabels = wanted.length === LOOKING_FOR.length
    ? 'Todos los profesionales'
    : LOOKING_FOR.filter((o) => wanted.includes(o.value)).map((o) => o.label).join(', ');

  return {
    name: fullName(v),
    badge: 'Productor',
    rows: [
      { icon: 'phone', text: v.phoneNumber || undefined },
      { icon: 'map', text: step >= 1 ? place(v) : undefined },
      { icon: 'leaf', text: step >= 2 ? [type, hectares].filter(Boolean).join(' · ') || undefined : undefined },
      { icon: 'search', text: step >= 3 && wantedLabels ? `Busca: ${wantedLabels}` : undefined },
    ],
  };
}

// ─── Profesionales ────────────────────────────────────────────────────────────

interface ProfessionalCopy {
  roleLabel: string;
  specialtyPlaceholder: string;
  coverageRequired: boolean;
  /** Agrónomo, contador y abogado ejercen con matrícula; el inversionista no. */
  requiresLicense: boolean;
}

const PROFESSIONAL_COPY: Record<Exclude<RegistrationKind, 'producer'>, ProfessionalCopy> = {
  agronomist: { roleLabel: 'Agrónomo', specialtyPlaceholder: 'Ej: Nutrición de suelos', coverageRequired: true, requiresLicense: true },
  accountant: { roleLabel: 'Contador', specialtyPlaceholder: 'Ej: Impuestos agropecuarios', coverageRequired: false, requiresLicense: true },
  lawyer: { roleLabel: 'Abogado', specialtyPlaceholder: 'Ej: Derecho agrario y contratos', coverageRequired: false, requiresLicense: true },
  investor: { roleLabel: 'Inversionista', specialtyPlaceholder: 'Ej: Financiamiento de campañas', coverageRequired: false, requiresLicense: false },
};

function professionalFlow(kind: Exclude<RegistrationKind, 'producer'>): RegistrationFlow {
  const { roleLabel, specialtyPlaceholder, coverageRequired, requiresLicense } = PROFESSIONAL_COPY[kind];

  return {
    kind,
    roleLabel,
    submitLabel: 'Crear cuenta',
    initialValues: { ...DEFAULT_LOCATION, coverageRadius: '100', yearsExperience: '', maxCapacity: '3' },
    steps: [
      {
        id: 'personal',
        title: 'Detrás de cada profesional hay una persona',
        subtitle: 'Antes de empezar, contanos un poco más sobre vos.',
        aside: 'Cada profesional de AgroNexo tiene un perfil propio. Los productores eligen con quién trabajar.',
        fields: personalFields,
      },
      {
        id: 'profile',
        title: 'Tu perfil profesional',
        subtitle: 'Contanos cómo trabajás para que te encuentren los productores indicados.',
        aside: requiresLicense
          ? 'Verificamos tu matrícula antes de recomendarte a los productores.'
          : 'Tu especialidad y experiencia definen a qué productores te recomendamos.',
        fields: [
          ...(requiresLicense
            ? [{ kind: 'text', name: 'licenseNumber', label: 'Matrícula', placeholder: 'Ej: 27512', required: true, maxLength: 50 } as const]
            : []),
          { kind: 'text', name: 'specialty', label: 'Especialidad', placeholder: specialtyPlaceholder, required: true, maxLength: 150 },
          { kind: 'number', name: 'yearsExperience', label: 'Años de experiencia', placeholder: '0', required: true, min: 0, max: 70 },
          {
            kind: 'number',
            name: 'maxCapacity',
            label: 'Productores que podés atender',
            placeholder: '3',
            required: true,
            min: 1,
            max: 200,
            hint: 'Podés cambiarlo cuando quieras.',
          },
        ],
      },
      {
        id: 'coverage',
        title: 'Tu zona de trabajo',
        subtitle: coverageRequired
          ? 'Indicá desde dónde atendés y hasta dónde llegás.'
          : 'Indicá desde dónde atendés. Dejalo vacío si trabajás de forma remota.',
        aside: 'Los productores dentro de tu zona de cobertura te ven primero.',
        fields: [
          { kind: 'location', levels: ['country', 'province'], required: coverageRequired },
          { kind: 'select', name: 'coverageRadius', label: 'Radio de cobertura', options: COVERAGE_RADIUS },
        ],
      },
    ],
    preview: (v, step) => ({
      name: fullName(v),
      badge: roleLabel,
      rows: [
        { icon: 'phone', text: v.phoneNumber || undefined },
        ...(requiresLicense ? [{ icon: 'badge' as const, text: step >= 1 && v.licenseNumber ? `Matrícula ${v.licenseNumber}` : undefined }] : []),
        { icon: 'briefcase', text: step >= 1 ? v.specialty : undefined },
        { icon: 'clock', text: step >= 1 && v.yearsExperience ? `${v.yearsExperience} años de experiencia` : undefined },
        { icon: 'compass', text: step >= 2 && v.province ? `${v.province} · ${v.coverageRadius} km` : undefined },
      ],
    }),
  };
}

// ─── Registro público ─────────────────────────────────────────────────────────

const producerFlow: RegistrationFlow = {
  kind: 'producer',
  roleLabel: 'Productor',
  submitLabel: 'Crear cuenta',
  initialValues: { ...DEFAULT_LOCATION, producerType: '', hectaresRange: '', lookingFor: '' },
  steps: producerSteps,
  preview: producerPreview,
};

export const REGISTRATION_FLOWS: Record<RegistrationKind, RegistrationFlow> = {
  producer: producerFlow,
  agronomist: professionalFlow('agronomist'),
  accountant: professionalFlow('accountant'),
  lawyer: professionalFlow('lawyer'),
  investor: professionalFlow('investor'),
};

/** Devuelve el tipo pedido por URL o `undefined` si no es válido (el usuario lo elige en el primer paso). */
export function resolveRegistrationKind(value?: string | null): RegistrationKind | undefined {
  return value && value in REGISTRATION_FLOWS ? (value as RegistrationKind) : undefined;
}
