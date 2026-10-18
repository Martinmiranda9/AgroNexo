import type { ProfessionalRole } from './identity.model';
import type { Workspace } from './farm.model';

/** Cultivos del backend (`CropType`). */
export type CropType =
  'Soybean' | 'Corn' | 'Wheat' | 'Sunflower' | 'Barley' | 'Sorghum' | 'Peanut' | 'Other';

/** Tipos de actividad del backend (`FarmActivityType`). */
export type FarmActivityType =
  | 'Sowing'
  | 'Spraying'
  | 'Fertilization'
  | 'Harvest'
  | 'Monitoring'
  | 'Visit'
  | 'Tillage'
  | 'Other';

/** Inicio, En proceso o Finalizado. */
export type FarmActivityStatus = 'Started' | 'InProgress' | 'Completed';

/** Etapa de un cultivo según sus fechas. */
export type CropPhase = 'Sowing' | 'Growing' | 'Harvest';

/** Fecha sin hora, como la manda el backend: `2026-10-13`. */
export type IsoDate = string;

export interface Campaign {
  id: string;
  /** "2026/27". */
  name: string;
  startsOn: IsoDate;
  endsOn: IsoDate;
}

export interface LotCrop {
  id: string;
  campaignId: string;
  crop: CropType;
  sowingDate: IsoDate | null;
  expectedHarvestDate: IsoDate | null;
  phase: CropPhase;
}

export interface LotLastLabor {
  type: FarmActivityType;
  status: FarmActivityStatus;
  date: IsoDate;
}

export interface Lot {
  id: string;
  name: string;
  hectares: number;
  crops: LotCrop[];
  /** Solo en el tablero: última labor de campo de la campaña. */
  lastLabor: LotLastLabor | null;
}

export interface FarmActivity {
  id: string;
  date: IsoDate;
  type: FarmActivityType;
  title: string;
  notes: string | null;
  status: FarmActivityStatus;
  completedAt: string | null;
  hectaresWorked: number | null;
  createdAt: string;
  campaignId: string | null;
  lot: { id: string; name: string } | null;
  /** `role` es `null` cuando la registró el productor. */
  author: { name: string; role: ProfessionalRole | null };
  /** El productor dueño o quien la registró. */
  canEdit: boolean;
}

export interface LaborProgress {
  type: FarmActivityType;
  hectaresWorked: number;
  hectaresPlanned: number;
  /** Entre 0 y 1. */
  progress: number;
}

export interface CropSurface {
  crop: CropType;
  hectares: number;
  lotCount: number;
}

export interface TimelinePlanting {
  lotId: string;
  lotName: string;
  crop: CropType;
  sowingDate: IsoDate | null;
  expectedHarvestDate: IsoDate | null;
  phase: CropPhase;
}

export interface CampaignTimeline {
  campaignId: string;
  name: string;
  startsOn: IsoDate;
  endsOn: IsoDate;
  today: IsoDate;
  /** Entre 0 y 1. */
  progress: number;
  plantings: TimelinePlanting[];
  nextHarvest: { lotName: string; crop: CropType; date: IsoDate; daysLeft: number } | null;
}

export interface WeeklySummary {
  from: IsoDate;
  to: IsoDate;
  activitiesCreated: number;
  activitiesCompleted: number;
  newMembers: number;
  highlights: FarmActivity[];
}

/** Tablero compartido del campo (`GET /api/v1/farms/{id}/dashboard`). */
export interface FarmDashboard {
  workspace: Workspace;
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  kpis: {
    totalHectares: number;
    teamSize: number;
    teamRoleCount: number;
    lotCount: number;
    lotHectares: number;
    cropCount: number;
    openActivities: number;
  };
  cropSurfaces: CropSurface[];
  lots: Lot[];
  laborProgress: LaborProgress[];
  timeline: CampaignTimeline | null;
  recentActivities: FarmActivity[];
  weeklySummary: WeeklySummary;
}

export type GetFarmDashboardResult =
  | { status: 'ok'; dashboard: FarmDashboard }
  | { status: 'not-found' }
  | { status: 'unauthorized' }
  | { status: 'unavailable' };

/** Resultado de las altas y cambios del tablero. */
export type FarmMutationResult<T> =
  | { status: 'ok'; data: T }
  /** Datos fuera de las reglas (400); `message` es el detalle del backend, en español. */
  | { status: 'invalid'; message: string | null }
  /** Ya existe (409): campaña o lote con el mismo nombre, cultivo repetido. */
  | { status: 'conflict'; message: string | null }
  | { status: 'forbidden' }
  | { status: 'not-found' }
  | { status: 'unauthorized' }
  | { status: 'unavailable' };

export interface CampaignInput {
  name: string;
  startsOn: IsoDate;
  endsOn: IsoDate;
}

export interface LotInput {
  name: string;
  hectares: number;
}

export interface LotCropInput {
  campaignId: string;
  crop: CropType;
  sowingDate: IsoDate | null;
  expectedHarvestDate: IsoDate | null;
}

export interface FarmActivityInput {
  type: FarmActivityType;
  title: string;
  notes: string | null;
  date: IsoDate;
  status: FarmActivityStatus;
  lotId: string | null;
  hectaresWorked: number | null;
}

/** Mismos límites que los DTOs del backend. */
export const LOT_NAME_MAX = 100;
export const ACTIVITY_TITLE_MAX = 120;
export const ACTIVITY_NOTES_MAX = 500;
