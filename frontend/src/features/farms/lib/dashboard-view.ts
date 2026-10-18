import type {
  CropPhase,
  CropType,
  FarmActivityStatus,
  FarmActivityType,
  IsoDate,
} from '@/core/models/farm-dashboard.model';
import { cropLabel as catalogCropLabel } from '@/shared/constants/need-labels';

/** "Soja"; los cultivos del backend coinciden con los ids del catálogo en minúscula. */
export const cropLabel = (crop: CropType): string =>
  catalogCropLabel(crop.toLowerCase()) ?? 'Otro cultivo';

/** Cultivos que se pueden cargar en un lote, en el orden en que se eligen. */
export const CROP_OPTIONS: CropType[] = [
  'Soybean',
  'Corn',
  'Wheat',
  'Sunflower',
  'Barley',
  'Sorghum',
  'Peanut',
  'Other',
];

export const ACTIVITY_TYPE_LABEL: Record<FarmActivityType, string> = {
  Sowing: 'Siembra',
  Spraying: 'Pulverización',
  Fertilization: 'Fertilización',
  Harvest: 'Cosecha',
  Tillage: 'Labranza',
  Monitoring: 'Monitoreo',
  Visit: 'Visita',
  Other: 'Otra',
};

/** Tipos en el orden del selector: primero las labores sobre la superficie, después el resto. */
export const ACTIVITY_TYPE_OPTIONS: FarmActivityType[] = [
  'Sowing',
  'Spraying',
  'Fertilization',
  'Harvest',
  'Tillage',
  'Monitoring',
  'Visit',
  'Other',
];

/** Labores que cuentan para el avance (trabajan la superficie del lote). */
export const isFieldLabor = (type: FarmActivityType): boolean =>
  type === 'Sowing' ||
  type === 'Spraying' ||
  type === 'Fertilization' ||
  type === 'Harvest' ||
  type === 'Tillage';

export const ACTIVITY_STATUS_LABEL: Record<FarmActivityStatus, string> = {
  Started: 'Inicio',
  InProgress: 'En proceso',
  Completed: 'Finalizado',
};

export const ACTIVITY_STATUS_OPTIONS: FarmActivityStatus[] = ['Started', 'InProgress', 'Completed'];

export const CROP_PHASE_LABEL: Record<CropPhase, string> = {
  Sowing: 'Por sembrar',
  Growing: 'En desarrollo',
  Harvest: 'En cosecha',
};

/** Fecha del backend (`2026-10-13`) como fecha local, sin corrimiento por zona horaria. */
function parseIsoDate(iso: IsoDate): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const DAY_FORMAT = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' });

/** "18 sep". */
export const formatDay = (iso: IsoDate): string =>
  DAY_FORMAT.format(parseIsoDate(iso)).replace('.', '');

/** "18 sep 2026" (Intl en es-AR escribe "18 de sep de 2026", que no entra en una línea). */
export const formatFullDate = (iso: IsoDate): string =>
  `${formatDay(iso)} ${parseIsoDate(iso).getFullYear()}`;

const PERCENT = new Intl.NumberFormat('es-AR', { style: 'percent', maximumFractionDigits: 0 });

/** 0,66 → "66 %". */
export const percentLabel = (ratio: number): string => PERCENT.format(ratio);

const NUMBER = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

/** "1.250,5". */
export const numberLabel = (value: number): string => NUMBER.format(value);

const AR_HOUR = new Intl.DateTimeFormat('es-AR', {
  hour: 'numeric',
  hourCycle: 'h23',
  timeZone: 'America/Argentina/Buenos_Aires',
});

/** Saludo según la hora de Argentina: días hasta las 12, tardes hasta las 20 y después noches. */
export function greetingFor(now: Date): string {
  const hour = Number(AR_HOUR.format(now));
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Fecha de hoy en Argentina como `2026-10-13`. */
export function todayIso(): IsoDate {
  const now = new Date(Date.now() - 3 * 3_600_000);
  return now.toISOString().slice(0, 10);
}

/**
 * Campaña sugerida para hoy: arranca el 1 de julio (fina y gruesa en el mismo ciclo) y termina el 30 de junio
 * siguiente. En octubre de 2026 sugiere "2026/27".
 */
export function suggestedCampaign(today: IsoDate): {
  name: string;
  startsOn: IsoDate;
  endsOn: IsoDate;
} {
  const date = parseIsoDate(today);
  const startYear = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
  return {
    name: `${startYear}/${String((startYear + 1) % 100).padStart(2, '0')}`,
    startsOn: `${startYear}-07-01`,
    endsOn: `${startYear + 1}-06-30`,
  };
}
