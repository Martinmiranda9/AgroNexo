'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  MdArrowDownward,
  MdArrowUpward,
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
import { Checkbox } from '@/ui/components/Checkbox';
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
import { NativeSelect, NativeSelectOption } from '@/ui/components/NativeSelect';
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  pageWindow,
} from '@/ui/components/Pagination';
import { SearchInput } from '@/ui/components/SearchInput';
import { SelectionBar } from '@/ui/components/SelectionBar';
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

const PAGE_SIZES = [5, 10, 20] as const;

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
  /** Cambio de estado de varias actividades a la vez, desde la barra de la selección. */
  onChangeStatusMany: (activities: FarmActivity[], status: FarmActivityStatus) => Promise<void>;
  emptyAction?: ReactNode;
}

/**
 * Actividad reciente del campo (el "Recent Activities" de la referencia): búsqueda y filtro por estado arriba, y la
 * tabla con fecha, labor, lote, responsable y estado. Quien puede editar una actividad cambia su estado desde "⋯" o
 * elige varias con las casillas y las pasa juntas desde la barra flotante (la de la referencia de tabla). Abajo, las
 * filas por página y la paginación.
 */
export default function ActivityTable({
  activities,
  pendingId,
  onChangeStatus,
  onChangeStatusMany,
  emptyAction,
}: ActivityTableProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>(ALL);
  const [newestFirst, setNewestFirst] = useState(true);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);

  const rows = useMemo(() => {
    const text = query.trim().toLowerCase();
    const direction = newestFirst ? 1 : -1;
    return [...activities]
      .sort(
        (a, b) =>
          (b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)) * direction
      )
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
  }, [activities, query, status, newestFirst]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstRow = rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, rows.length);

  // Al buscar, filtrar o cambiar las filas por página se vuelve a la primera.
  useEffect(() => setPage(1), [query, status, pageSize]);

  // La selección vive sobre las actividades que existen: si una desaparece o deja de ser editable, sale.
  useEffect(() => {
    setSelected((current) => {
      const editable = new Set(activities.filter((a) => a.canEdit).map((a) => a.id));
      const next = new Set([...current].filter((id) => editable.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [activities]);

  const selectableOnPage = pageRows.filter((activity) => activity.canEdit);
  const pageSelectedCount = selectableOnPage.filter((a) => selected.has(a.id)).length;
  const allOnPage = selectableOnPage.length > 0 && pageSelectedCount === selectableOnPage.length;
  const someOnPage = pageSelectedCount > 0 && !allOnPage;
  const selectedActivities = activities.filter((activity) => selected.has(activity.id));

  const toggleRow = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const togglePage = () =>
    setSelected((current) => {
      const next = new Set(current);
      for (const activity of selectableOnPage) {
        if (allOnPage) next.delete(activity.id);
        else next.add(activity.id);
      }
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const changeSelected = async (next: FarmActivityStatus) => {
    setBulkPending(true);
    await onChangeStatusMany(
      selectedActivities.filter((activity) => activity.status !== next),
      next
    );
    setBulkPending(false);
    clearSelection();
  };

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
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={allOnPage}
                    indeterminate={someOnPage}
                    disabled={selectableOnPage.length === 0}
                    onCheckedChange={togglePage}
                    aria-label="Elegir todas las actividades de esta página"
                  />
                </TableHead>
                <TableHead aria-sort={newestFirst ? 'descending' : 'ascending'}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="-ml-2"
                    onClick={() => setNewestFirst((current) => !current)}
                  >
                    Fecha
                    {newestFirst ? (
                      <MdArrowDownward data-icon="inline-end" aria-hidden />
                    ) : (
                      <MdArrowUpward data-icon="inline-end" aria-hidden />
                    )}
                    <span className="sr-only">
                      {newestFirst
                        ? ', de la más nueva a la más vieja'
                        : ', de la más vieja a la más nueva'}
                    </span>
                  </Button>
                </TableHead>
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
              {pageRows.length > 0 ? (
                pageRows.map((activity) => {
                  const TypeIcon = TYPE_ICON[activity.type];
                  const isSelected = selected.has(activity.id);
                  return (
                    <TableRow key={activity.id} data-state={isSelected ? 'selected' : undefined}>
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={isSelected}
                          disabled={!activity.canEdit}
                          onCheckedChange={() => toggleRow(activity.id)}
                          aria-label={`Elegir ${activity.title}`}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
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
                  <TableCell colSpan={7} className="text-muted-foreground h-20 text-center">
                    No hay actividades con esa búsqueda o estado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {activities.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <label htmlFor="activity-page-size">Filas por página</label>
            <NativeSelect
              id="activity-page-size"
              size="sm"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {PAGE_SIZES.map((size) => (
                <NativeSelectOption key={size} value={size}>
                  {size}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <span className="tabular-nums" aria-live="polite">
              {firstRow}–{lastRow} de {rows.length}
            </span>
          </div>
          {pageCount > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  />
                </PaginationItem>
                {pageWindow(currentPage, pageCount).map((item, index) => (
                  <PaginationItem key={item ?? `gap-${index}`}>
                    {item === null ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationButton
                        isActive={item === currentPage}
                        aria-label={`Página ${item}`}
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </PaginationButton>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      <SelectionBar
        count={selected.size}
        noun={{ one: 'actividad elegida', other: 'actividades elegidas' }}
        onClear={clearSelection}
      >
        {ACTIVITY_STATUS_OPTIONS.filter((option) => option !== 'Started').map((option) => (
          <Button
            key={option}
            type="button"
            variant="outline"
            size="sm"
            disabled={bulkPending || selectedActivities.every((a) => a.status === option)}
            onClick={() => changeSelected(option)}
          >
            Pasar a {ACTIVITY_STATUS_LABEL[option].toLowerCase()}
          </Button>
        ))}
      </SelectionBar>
    </Card>
  );
}
