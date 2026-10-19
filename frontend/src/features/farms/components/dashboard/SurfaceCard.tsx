'use client';

import {
  MdAdd,
  MdCheck,
  MdKeyboardArrowDown,
  MdMoreVert,
  MdOutlineCalendarToday,
  MdOutlinePersonAddAlt,
  MdWhatsapp,
} from 'react-icons/md';
import type { Campaign, FarmDashboard, Lot } from '@/core/models/farm-dashboard.model';
import type { FarmContact } from '@/core/models/farm.model';
import { cn } from '@/shared/utils/cn';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { IconButton } from '@/ui/components/IconButton';
import { CROP_PHASE_LABEL, cropLabel, numberLabel } from '../../lib/dashboard-view';

interface SurfaceCardProps {
  dashboard: FarmDashboard;
  /** El productor dueño y el campo sin archivar: arma lotes, campañas e invita. */
  canManage: boolean;
  archived: boolean;
  /** Contacto del productor: lo ve el profesional del equipo. */
  producerContact: FarmContact | null;
  onSelectCampaign: (campaignId: string) => void;
  onNewActivity: () => void;
  onInvite: () => void;
  onNewCampaign: () => void;
  onNewLot: () => void;
  /** Cargar el cultivo de la campaña en un lote (solo con campaña elegida). */
  onAddCrop?: (lot: Lot) => void;
}

/** Chat de WhatsApp con el productor (wa.me pide el número solo con dígitos). */
const whatsappHref = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '')}`;

const lotsLabel = (count: number) => (count === 1 ? '1 lote' : `${count} lotes`);

function CampaignMenu({
  campaigns,
  selectedCampaignId,
  canManage,
  onSelectCampaign,
  onNewCampaign,
}: {
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  canManage: boolean;
  onSelectCampaign: (campaignId: string) => void;
  onNewCampaign: () => void;
}) {
  const selected = campaigns.find((c) => c.id === selectedCampaignId) ?? null;

  if (campaigns.length === 0) {
    return canManage ? (
      <Button type="button" variant="outline" size="sm" onClick={onNewCampaign}>
        <MdAdd data-icon="inline-start" aria-hidden />
        Crear campaña
      </Button>
    ) : null;
  }

  return (
    <DropdownMenu>
      {/* `data-slot="button"`: el trigger pisa el del Button y se perdería la escala de alturas del kit. */}
      <DropdownMenuTrigger
        data-slot="button"
        render={<Button variant="outline" size="sm" aria-label="Elegir campaña" />}
      >
        <MdOutlineCalendarToday data-icon="inline-start" aria-hidden />
        <span className="tabular-nums">{selected?.name ?? 'Campaña'}</span>
        <MdKeyboardArrowDown data-icon="inline-end" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Campañas</DropdownMenuLabel>
          {campaigns.map((campaign) => (
            <DropdownMenuItem key={campaign.id} onClick={() => onSelectCampaign(campaign.id)}>
              <span className="flex-1 tabular-nums">{campaign.name}</span>
              {campaign.id === selectedCampaignId && <MdCheck size={16} aria-hidden />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onNewCampaign}>
              <MdAdd size={16} aria-hidden />
              Nueva campaña
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Estado del lote en la campaña elegida: verde si el cultivo ya está en el lote, naranja si falta sembrar. */
function lotStatus(lot: Lot, campaignId: string | null) {
  const crop = lot.crops.find((c) => c.campaignId === campaignId) ?? null;
  if (!crop) return { crop: null, text: 'Sin cultivo', tone: 'text-muted-foreground' };
  return {
    crop,
    text: CROP_PHASE_LABEL[crop.phase],
    tone: crop.phase === 'Sowing' ? 'text-warning-foreground' : 'text-success-foreground',
  };
}

/**
 * Card principal del tablero (el "Total Balance" de la referencia): la superficie del campo con el selector de
 * campaña, las dos acciones del día a día y, abajo, los lotes en tarjetas chicas (las "wallets").
 */
export default function SurfaceCard({
  dashboard,
  canManage,
  archived,
  producerContact,
  onSelectCampaign,
  onNewActivity,
  onInvite,
  onNewCampaign,
  onNewLot,
  onAddCrop,
}: SurfaceCardProps) {
  const { kpis, lots, campaigns, selectedCampaignId } = dashboard;
  const unassigned = Math.max(0, kpis.totalHectares - kpis.lotHectares);

  return (
    <Card className="flex h-full min-w-0 flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3 px-1 pt-1">
        <div className="min-w-0">
          <p className="text-body-sm text-muted-foreground">Superficie del campo</p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-heading-lg text-foreground tracking-tight tabular-nums">
              {numberLabel(kpis.totalHectares)}
            </span>
            <span className="text-muted-foreground text-base font-medium">ha</span>
          </p>
          <p className="text-caption text-muted-foreground mt-1.5 flex flex-wrap items-center gap-2">
            {kpis.lotCount > 0 ? (
              <>
                <Badge variant="success" className="tabular-nums">
                  {numberLabel(kpis.lotHectares)} ha en lotes
                </Badge>
                {unassigned > 0 && (
                  <span className="tabular-nums">{numberLabel(unassigned)} ha sin asignar</span>
                )}
              </>
            ) : (
              'Todavía sin lotes'
            )}
          </p>
        </div>
        <CampaignMenu
          campaigns={campaigns}
          selectedCampaignId={selectedCampaignId}
          canManage={canManage}
          onSelectCampaign={onSelectCampaign}
          onNewCampaign={onNewCampaign}
        />
      </div>

      {!archived && (
        <div className="grid gap-2 min-[400px]:grid-cols-2">
          <Button type="button" size="lg" className="px-4" onClick={onNewActivity}>
            <MdAdd data-icon="inline-start" size={20} aria-hidden />
            Nueva actividad
          </Button>
          {canManage ? (
            <Button type="button" variant="secondary" size="lg" className="px-4" onClick={onInvite}>
              <MdOutlinePersonAddAlt data-icon="inline-start" size={20} aria-hidden />
              Invitar
            </Button>
          ) : (
            producerContact && (
              <Button
                render={
                  <a
                    href={whatsappHref(producerContact.phoneNumber)}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                nativeButton={false}
                variant="secondary"
                size="lg"
                className="px-4"
              >
                <MdWhatsapp data-icon="inline-start" size={20} aria-hidden />
                Productor
              </Button>
            )
          )}
        </div>
      )}

      <section aria-labelledby="lots-title" className="bg-surface-sunken mt-auto rounded-xl p-2.5">
        <div className="flex items-center justify-between gap-2 px-1.5 pt-0.5 pb-2">
          <p className="text-body-sm text-muted-foreground">
            <span id="lots-title" className="text-foreground font-medium">
              Lotes
            </span>
            <span className="text-border mx-2" aria-hidden>
              |
            </span>
            Total {lotsLabel(lots.length)}
          </p>
          {canManage && (
            <Button type="button" variant="ghost" size="xs" onClick={onNewLot}>
              <MdAdd data-icon="inline-start" aria-hidden />
              Nuevo lote
            </Button>
          )}
        </div>

        {lots.length === 0 ? (
          <p className="text-caption text-muted-foreground px-1.5 pb-1.5">
            {canManage
              ? 'Dividí el campo en lotes para cargar cultivos y labores.'
              : 'El productor todavía no cargó lotes.'}
          </p>
        ) : (
          <ul className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {lots.map((lot) => {
              const status = lotStatus(lot, selectedCampaignId);
              const canAddCrop = onAddCrop && !status.crop;
              return (
                <li
                  key={lot.id}
                  className="bg-card min-w-[8.75rem] flex-1 rounded-lg p-3 [box-shadow:var(--shadow-xs)]"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-body-sm text-foreground truncate font-medium">{lot.name}</p>
                    {canAddCrop && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <IconButton
                              variant="ghost"
                              size="sm"
                              shape="round"
                              aria-label={`Acciones de ${lot.name}`}
                              className="-mt-1 -mr-1.5"
                            />
                          }
                        >
                          <MdMoreVert aria-hidden />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem onClick={() => onAddCrop(lot)}>
                            <MdAdd size={16} aria-hidden />
                            Cargar cultivo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-foreground mt-2 font-semibold tabular-nums">
                    {numberLabel(lot.hectares)} ha
                  </p>
                  <p className="text-caption text-muted-foreground truncate">
                    {status.crop ? cropLabel(status.crop.crop) : '—'}
                  </p>
                  <p className={cn('text-caption mt-1 font-medium', status.tone)}>{status.text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Card>
  );
}
