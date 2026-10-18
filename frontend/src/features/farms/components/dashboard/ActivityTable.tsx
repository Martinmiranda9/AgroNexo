'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  MdMoreHoriz,
  MdOutlineAgriculture,
  MdOutlineDirectionsCar,
  MdOutlineFilterList,
  MdOutlineGrass,
  MdOutlineLandscape,
  MdOutlineMoreHoriz,
  MdOutlineScience,
  MdOutlineVisibility,
  MdOutlineWaterDrop,
} from 'react-icons/md';
import type {
  FarmActivity,
  FarmActivityStatus,
  FarmActivityType,
} from '@/core/models/farm-dashboard.model';
import { professionalRoleLabel } from '@/shared/constants/roles';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { IconButton } from '@/ui/components/IconButton';
import { SearchInput } from '@/ui/components/SearchInput';
import { StatusIndicator, type StatusIndicatorProps } from '@/ui/components/StatusIndicator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/Table';
import {
  ACTIVITY_STATUS_LABEL,
  ACTIVITY_STATUS_OPTIONS,
  ACTIVITY_TYPE_LABEL,
  formatDay,
  numberLabel,
} from '../../lib/dashboard-view';

const ALL = 'all';

const TYPE_ICON: Record<FarmActivityType, IconType> = {
  Sowing: MdOutlineGrass,
  Spraying: MdOutlineWaterDrop,
  Fertilization: MdOutlineScience,
  Harvest: MdOutlineAgriculture,
  Tillage: MdOutlineLandscape,
  Monitoring: MdOutlineVisibility,
  Visit: MdOutlineDirectionsCar,
  Other: MdOutlineMoreHoriz,
};

/** Punto del estado: gris al inicio, naranja en proceso y verde al terminar. */
const STATUS_DOT: Record<FarmActivityStatus, StatusIndicatorProps['status']> = {
  Started: 'idle',
  InProgress: 'away',
  Completed: 'online',
};

interface ActivityTableProps {
  activities: FarmActivity[];
  /** Actividad que se está guardando (deshabilita su cambio de estado). */
  pendingId: string | null;
  onChangeStatus: (activity: FarmActivity, status: FarmActivityStatus) => void;
  emptyAction?: ReactNode;
}

/**
 * Actividad reciente del campo (el "Recent Activities" de la referencia): búsqueda y filtro por estado arriba, y la
 * tabla con fecha, labor, lote, responsable y estado. Quien puede editar una actividad cambia su estado desde "⋯".
 */
export default function ActivityTable({
  activities,
  pendingId,
  onChangeStatus,
  emptyAction,
}: ActivityTableProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>(ALL);

  const rows = useMemo(() => {
    const text = query.trim().toLowerCase();
    return [...activities]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .filter((activity) => status === ALL || activity.status === status)
      .filter(
        (activity) =>
          !text ||
          [
            activity.title,
            ACTIVITY_TYPE_LABEL[activity.type],
            activity.lot?.name ?? 'Todo el campo',
            activity.author.name,
          ].some((value) => value.toLowerCase().includes(text))
      );
  }, [activities, query, status]);

  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-heading-sm text-foreground font-medium">Actividad reciente</h2>
        {activities.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-full sm:w-60">
              <SearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onClear={() => setQuery('')}
                placeholder="Buscar"
                aria-label="Buscar actividades"
                className="rounded-full"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                data-slot="button"
                render={<Button variant="outline" aria-label="Filtrar por estado" />}
              >
                {status === ALL ? 'Filtro' : ACTIVITY_STATUS_LABEL[status as FarmActivityStatus]}
                <MdOutlineFilterList data-icon="inline-end" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Estado</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                    <DropdownMenuRadioItem value={ALL}>Todas</DropdownMenuRadioItem>
                    {ACTIVITY_STATUS_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem key={option} value={option}>
                        {ACTIVITY_STATUS_LABEL[option]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="bg-surface-sunken flex flex-1 flex-col items-start justify-center gap-4 rounded-xl p-5">
          <p className="text-body-sm text-muted-foreground">
            Registrá siembras, pulverizaciones o visitas para que el equipo vea en qué anda el
            campo.
          </p>
          {emptyAction}
        </div>
      ) : (
        <div className="border-border overflow-hidden rounded-xl border">
          <Table>
            <TableHeader className="bg-surface-sunken">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Fecha</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10 pr-3">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((activity) => {
                  const TypeIcon = TYPE_ICON[activity.type];
                  return (
                    <TableRow key={activity.id}>
                      <TableCell className="text-muted-foreground pl-4 tabular-nums">
                        {formatDay(activity.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-44 items-center gap-2.5">
                          <span className="bg-surface-sunken text-foreground flex size-7 shrink-0 items-center justify-center rounded-full">
                            <TypeIcon size={15} aria-hidden />
                          </span>
                          <span className="min-w-0">
                            <span
                              className="text-foreground block truncate font-medium"
                              title={activity.title}
                            >
                              {activity.title}
                            </span>
                            <span className="text-caption text-muted-foreground block">
                              {ACTIVITY_TYPE_LABEL[activity.type]}
                              {activity.hectaresWorked !== null &&
                                ` · ${numberLabel(activity.hectaresWorked)} ha`}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {activity.lot?.name ?? 'Todo el campo'}
                      </TableCell>
                      <TableCell>
                        <span className="text-foreground block">{activity.author.name}</span>
                        <span className="text-caption text-muted-foreground block">
                          {activity.author.role
                            ? professionalRoleLabel(activity.author.role)
                            : 'Productor'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusIndicator
                          status={STATUS_DOT[activity.status]}
                          label={ACTIVITY_STATUS_LABEL[activity.status]}
                        />
                      </TableCell>
                      <TableCell className="pr-3">
                        {activity.canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  shape="round"
                                  disabled={pendingId === activity.id}
                                  aria-label={`Cambiar estado de ${activity.title}`}
                                />
                              }
                            >
                              <MdMoreHoriz aria-hidden />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-44">
                              {ACTIVITY_STATUS_OPTIONS.filter((s) => s !== activity.status).map(
                                (next) => (
                                  <DropdownMenuItem
                                    key={next}
                                    onClick={() => onChangeStatus(activity, next)}
                                  >
                                    Pasar a {ACTIVITY_STATUS_LABEL[next].toLowerCase()}
                                  </DropdownMenuItem>
                                )
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="text-muted-foreground h-20 text-center">
                    No hay actividades con esa búsqueda o estado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
