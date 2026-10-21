'use client';

import { useMemo, useState } from 'react';
import {
  MdOutlineAgriculture,
  MdOutlineCalendarMonth,
  MdOutlineDraw,
  MdOutlineSquareFoot,
  MdOutlineTimeline,
} from 'react-icons/md';
import type { Lot, LotEditor } from '@/core/models/farm-dashboard.model';
import type { GeoPoint } from '@/core/models/farm.model';
import { professionalRoleLabel } from '@/shared/constants/roles';
import { Badge, BadgeDot } from '@/ui/components/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/Dialog';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/ui/components/Item';
import {
  ACTIVITY_STATUS_LABEL,
  ACTIVITY_TYPE_LABEL,
  CROP_PHASE_LABEL,
  cropLabel,
  formatFullDate,
  numberLabel,
} from '../../lib/dashboard-view';
import { openRing } from '../../lib/lot-geometry';
import LazyFieldMap from '../map/LazyFieldMap';

interface LotDetailsDialogProps {
  /** `null`: cerrado. */
  lot: Lot | null;
  /** Todos los lotes del campo: el elegido se resalta y los demás quedan de referencia. */
  lots: Lot[];
  /** Perímetro del campo (anillo cerrado). */
  perimeter: GeoPoint[];
  /** Campaña elegida en el tablero: el cultivo que se muestra es el de esa campaña. */
  campaignId: string | null;
  onClose: () => void;
}

/** "Ana Gómez · Ing. agrónoma" o el nombre del productor. */
const editorLabel = (editor: LotEditor) =>
  editor.role ? `${editor.name} · ${professionalRoleLabel(editor.role)}` : editor.name;

/** Fecha y hora del backend (`2026-10-19T02:30:00Z`) como día local: "19 oct 2026". */
const dayOf = (isoDateTime: string) => {
  const date = new Date(isoDateTime);
  const pad = (n: number) => String(n).padStart(2, '0');
  return formatFullDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
};

/** Popup grande de un lote: su ubicación en el mapa satelital y sus datos (superficie, cultivo, labor, quién lo ubicó). */
export default function LotDetailsDialog({
  lot,
  lots,
  perimeter,
  campaignId,
  onClose,
}: LotDetailsDialogProps) {
  // Mientras se cierra, el popup sigue mostrando el último lote para que la animación no quede vacía.
  const [lastLot, setLastLot] = useState<Lot | null>(lot);
  if (lot && lot !== lastLot) setLastLot(lot);
  const shown = lot ?? lastLot;

  const farmPerimeter = useMemo(() => openRing(perimeter), [perimeter]);
  const shapes = useMemo(
    () =>
      lots
        .filter((l) => l.boundaryCoordinates.length > 0)
        .map((l) => ({ id: l.id, label: l.name, points: openRing(l.boundaryCoordinates) })),
    [lots]
  );

  if (!shown) return null;

  const crop = shown.crops.find((c) => c.campaignId === campaignId) ?? null;
  const drawn = shown.boundaryCoordinates.length > 0;

  return (
    <Dialog
      open={lot !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {shown.name}
            {crop && (
              <Badge variant={crop.phase === 'Sowing' ? 'warning' : 'success'}>
                <BadgeDot />
                {CROP_PHASE_LABEL[crop.phase]}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {numberLabel(shown.hectares)} ha
            {crop ? ` · ${cropLabel(crop.crop)}` : ' · Sin cultivo en la campaña'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex h-[min(32rem,60dvh)] flex-col gap-2">
            <LazyFieldMap
              key={shown.id}
              size="fill"
              perimeter={farmPerimeter}
              shapes={shapes}
              highlightId={shown.id}
              aria-label={`Mapa de ${shown.name}`}
            />
          </div>

          <ItemGroup className="gap-2">
            <Item variant="muted">
              <ItemMedia variant="icon">
                <MdOutlineSquareFoot aria-hidden />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Superficie declarada</ItemDescription>
                <ItemTitle className="text-figure">{numberLabel(shown.hectares)} ha</ItemTitle>
              </ItemContent>
            </Item>

            <Item variant="muted">
              <ItemMedia variant="icon">
                <MdOutlineAgriculture aria-hidden />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Cultivo de la campaña</ItemDescription>
                <ItemTitle>{crop ? cropLabel(crop.crop) : 'Sin cultivo'}</ItemTitle>
              </ItemContent>
            </Item>

            {crop && (crop.sowingDate || crop.expectedHarvestDate) && (
              <Item variant="muted">
                <ItemMedia variant="icon">
                  <MdOutlineCalendarMonth aria-hidden />
                </ItemMedia>
                <ItemContent>
                  <ItemDescription>Siembra y cosecha</ItemDescription>
                  <ItemTitle>
                    {crop.sowingDate ? formatFullDate(crop.sowingDate) : 'Sin fecha'} →{' '}
                    {crop.expectedHarvestDate
                      ? formatFullDate(crop.expectedHarvestDate)
                      : 'Sin fecha'}
                  </ItemTitle>
                </ItemContent>
              </Item>
            )}

            <Item variant="muted">
              <ItemMedia variant="icon">
                <MdOutlineTimeline aria-hidden />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Última labor</ItemDescription>
                <ItemTitle>
                  {shown.lastLabor
                    ? `${ACTIVITY_TYPE_LABEL[shown.lastLabor.type]} · ${ACTIVITY_STATUS_LABEL[shown.lastLabor.status]}`
                    : 'Sin labores en la campaña'}
                </ItemTitle>
                {shown.lastLabor && (
                  <ItemDescription>{formatFullDate(shown.lastLabor.date)}</ItemDescription>
                )}
              </ItemContent>
            </Item>

            <Item variant="muted">
              <ItemMedia variant="icon">
                <MdOutlineDraw aria-hidden />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Ubicación en el mapa</ItemDescription>
                {drawn && shown.boundaryEditedBy ? (
                  <>
                    <ItemTitle>Ubicado por {editorLabel(shown.boundaryEditedBy)}</ItemTitle>
                    {shown.boundaryEditedAt && (
                      <ItemDescription>{dayOf(shown.boundaryEditedAt)}</ItemDescription>
                    )}
                  </>
                ) : (
                  <ItemTitle>Sin ubicar en el mapa</ItemTitle>
                )}
              </ItemContent>
            </Item>

            <p className="text-caption text-muted-foreground px-1">
              Creado por {editorLabel(shown.createdBy)}
            </p>
          </ItemGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
