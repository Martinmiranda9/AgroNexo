'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MdAdd, MdOutlinePersonAddAlt } from 'react-icons/md';
import { updateFarmActivityStatusAction } from '@/core/actions/update-farm-activity-status.action';
import type {
  FarmActivity,
  FarmActivityStatus,
  FarmDashboard,
  Lot,
} from '@/core/models/farm-dashboard.model';
import type { GeoPoint } from '@/core/models/farm.model';
import { Button } from '@/ui/components/Button';
import { toast } from '@/ui/components/Toaster';
import { ACTIVITY_STATUS_LABEL } from '../../lib/dashboard-view';
import InviteMembersDrawer from '../InviteMembersDrawer';
import ActivityTable from './ActivityTable';
import CampaignProgressCard from './CampaignProgressCard';
import DashboardGreeting from './DashboardGreeting';
import { failureCopy } from './FormDrawer';
import KpiTilesCard from './KpiTilesCard';
import LaborChartCard from './LaborChartCard';
import LotDetailsDialog from './LotDetailsDialog';
import LotDrawer, { type LotDrawerMode } from './LotDrawer';
import NewActivityDrawer from './NewActivityDrawer';
import NewCampaignDrawer from './NewCampaignDrawer';
import SurfaceCard from './SurfaceCard';
import TeamCard from './TeamCard';

type Panel = 'activity' | 'campaign' | 'invite' | null;

const NO_PERIMETER: GeoPoint[] = [];

interface FarmDashboardScreenProps {
  dashboard: FarmDashboard;
  /** "Buenos días", "Buenas tardes" o "Buenas noches". */
  greeting: string;
  /** Nombre de quien mira el tablero, para el saludo. */
  viewerFirstName: string;
}

/**
 * Tablero compartido del campo, con la estructura del tablero de referencia: el saludo arriba y una grilla de tres
 * columnas. Primera fila: superficie y lotes, las cuatro casillas de la campaña y el avance de labores. Segunda fila:
 * campaña y equipo apilados a la izquierda y la actividad reciente en las otras dos columnas. Lo ve igual todo el
 * equipo; el productor además arma campañas, lotes e invitaciones.
 */
export default function FarmDashboardScreen({
  dashboard,
  greeting,
  viewerFirstName,
}: FarmDashboardScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [panel, setPanel] = useState<Panel>(null);
  const [lotMode, setLotMode] = useState<LotDrawerMode | null>(null);
  const [viewedLot, setViewedLot] = useState<Lot | null>(null);
  const [pendingActivity, setPendingActivity] = useState<string | null>(null);

  const { workspace } = dashboard;
  const isOwner = workspace.viewerRole === 'Owner';
  const archived = workspace.archivedAt !== null;
  const canManage = isOwner && !archived;
  const campaign = dashboard.campaigns.find((c) => c.id === dashboard.selectedCampaignId) ?? null;

  const close = () => setPanel(null);

  const selectCampaign = (campaignId: string) =>
    router.push(`${pathname}?campaign=${encodeURIComponent(campaignId)}`, { scroll: false });

  const changeStatus = async (activity: FarmActivity, status: FarmActivityStatus) => {
    setPendingActivity(activity.id);
    const outcome = await updateFarmActivityStatusAction(workspace.farmId, activity.id, status);
    setPendingActivity(null);

    if (outcome.status === 'ok') {
      toast.success(`${activity.title}: ${ACTIVITY_STATUS_LABEL[status].toLowerCase()}`);
      router.refresh();
    } else {
      toast.error(failureCopy(outcome));
    }
  };

  const changeStatusMany = async (activities: FarmActivity[], status: FarmActivityStatus) => {
    if (activities.length === 0) return;
    const outcomes = await Promise.all(
      activities.map((activity) =>
        updateFarmActivityStatusAction(workspace.farmId, activity.id, status)
      )
    );
    const failed = outcomes.filter((outcome) => outcome.status !== 'ok');
    const done = outcomes.length - failed.length;

    if (done > 0) {
      toast.success(
        `${done === 1 ? '1 actividad pasó' : `${done} actividades pasaron`} a ${ACTIVITY_STATUS_LABEL[status].toLowerCase()}`
      );
      router.refresh();
    }
    const firstFailure = failed[0];
    if (firstFailure) toast.error(failureCopy(firstFailure));
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardGreeting
        greeting={greeting}
        firstName={viewerFirstName}
        workspace={workspace}
        archived={archived}
        onInvite={canManage ? () => setPanel('invite') : undefined}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SurfaceCard
          dashboard={dashboard}
          canManage={canManage}
          canAddLots={dashboard.canEditLots}
          archived={archived}
          producerContact={workspace.producerContact}
          onSelectCampaign={selectCampaign}
          onNewActivity={() => setPanel('activity')}
          onInvite={() => setPanel('invite')}
          onNewCampaign={() => setPanel('campaign')}
          onNewLot={() => setLotMode({ kind: 'new' })}
          onAddCrop={canManage && campaign ? (lot) => setLotMode({ kind: 'crop', lot }) : undefined}
          onViewLot={setViewedLot}
        />
        <KpiTilesCard dashboard={dashboard} />
        <div className="min-w-0 md:col-span-2 xl:col-span-1">
          <LaborChartCard laborProgress={dashboard.laborProgress} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <CampaignProgressCard
            timeline={dashboard.timeline}
            emptyAction={
              canManage && (
                <Button type="button" variant="outline" onClick={() => setPanel('campaign')}>
                  <MdAdd data-icon="inline-start" size={18} aria-hidden />
                  Crear campaña
                </Button>
              )
            }
          />
          <TeamCard
            producerName={workspace.producerName}
            members={workspace.members}
            action={
              canManage && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPanel('invite')}
                >
                  <MdOutlinePersonAddAlt data-icon="inline-start" aria-hidden />
                  Invitar
                </Button>
              )
            }
          />
        </div>
        <div className="min-w-0 xl:col-span-2">
          <ActivityTable
            activities={dashboard.recentActivities}
            pendingId={pendingActivity}
            onChangeStatus={changeStatus}
            onChangeStatusMany={changeStatusMany}
            emptyAction={
              !archived && (
                <Button type="button" variant="outline" onClick={() => setPanel('activity')}>
                  <MdAdd data-icon="inline-start" size={18} aria-hidden />
                  Registrar la primera
                </Button>
              )
            }
          />
        </div>
      </div>

      <NewActivityDrawer
        open={panel === 'activity'}
        farmId={workspace.farmId}
        lots={dashboard.lots}
        onClose={close}
        onCreated={(activity) => {
          close();
          toast.success('Registraste la actividad', { description: activity.title });
          router.refresh();
        }}
      />

      <LotDetailsDialog
        lot={viewedLot}
        lots={dashboard.lots}
        perimeter={workspace.locationCoordinates ?? NO_PERIMETER}
        campaignId={dashboard.selectedCampaignId}
        onClose={() => setViewedLot(null)}
      />

      {dashboard.canEditLots && (
        <LotDrawer
          mode={lotMode}
          farmId={workspace.farmId}
          campaign={campaign}
          perimeter={workspace.locationCoordinates ?? NO_PERIMETER}
          lots={dashboard.lots}
          farmHectares={workspace.totalHectares}
          canManageCrops={canManage}
          onClose={() => setLotMode(null)}
          onSaved={(message) => {
            setLotMode(null);
            toast.success(message);
            router.refresh();
          }}
        />
      )}

      {isOwner && (
        <>
          <NewCampaignDrawer
            open={panel === 'campaign'}
            farmId={workspace.farmId}
            onClose={close}
            onCreated={(created) => {
              close();
              toast.success(`Creaste la campaña ${created.name}`);
              selectCampaign(created.id);
              router.refresh();
            }}
          />
          <InviteMembersDrawer
            target={panel === 'invite' ? { farmId: workspace.farmId, name: workspace.name } : null}
            onClose={() => {
              close();
              router.refresh();
            }}
          />
        </>
      )}
    </div>
  );
}
