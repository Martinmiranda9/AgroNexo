import { MdOutlineGrass, MdOutlineGroups, MdOutlineSpa, MdOutlineTaskAlt } from 'react-icons/md';
import type { FarmDashboard } from '@/core/models/farm-dashboard.model';
import { Badge } from '@/ui/components/Badge';
import { Card } from '@/ui/components/Card';
import { StatCard } from '@/ui/components/StatCard';
import { cropLabel, numberLabel, percentLabel } from '../../lib/dashboard-view';

/**
 * Los cuatro números de la campaña en una card con cuatro casillas, como la de la referencia: la siembra va destacada
 * en verde campo y el resto en gris. Los tags dicen algo real (avance, pendientes); no hay comparaciones inventadas.
 */
export default function KpiTilesCard({ dashboard }: { dashboard: FarmDashboard }) {
  const { kpis, laborProgress, cropSurfaces, weeklySummary } = dashboard;
  const sowing = laborProgress.find((labor) => labor.type === 'Sowing') ?? null;
  const topCrop = [...cropSurfaces].sort((a, b) => b.hectares - a.hectares)[0] ?? null;
  const created = weeklySummary.activitiesCreated;

  return (
    <Card className="grid h-full min-w-0 grid-cols-1 gap-3 p-3 sm:grid-cols-2">
      <StatCard
        tone="brand"
        label="Sembrado"
        value={sowing ? numberLabel(sowing.hectaresWorked) : '—'}
        unit={sowing ? 'ha' : undefined}
        icon={<MdOutlineGrass aria-hidden />}
        description={
          sowing && sowing.hectaresPlanned > 0 ? (
            <>
              <Badge variant="inverse" className="tabular-nums">
                {percentLabel(sowing.progress)}
              </Badge>
              <span className="truncate tabular-nums">
                de {numberLabel(sowing.hectaresPlanned)} ha
              </span>
            </>
          ) : (
            'Sin lotes para sembrar'
          )
        }
      />
      <StatCard
        tone="tile"
        label="Cultivos"
        value={kpis.cropCount}
        icon={<MdOutlineSpa aria-hidden />}
        description={
          topCrop ? (
            <>
              <Badge variant="success" className="tabular-nums">
                {numberLabel(topCrop.hectares)} ha
              </Badge>
              <span className="truncate">{cropLabel(topCrop.crop)}</span>
            </>
          ) : (
            'Sin cultivos'
          )
        }
      />
      <StatCard
        tone="tile"
        label="En curso"
        value={kpis.openActivities}
        icon={<MdOutlineTaskAlt aria-hidden />}
        description={
          <>
            <Badge variant={created > 0 ? 'success' : 'secondary'} className="tabular-nums">
              +{created}
            </Badge>
            <span className="truncate">esta semana</span>
          </>
        }
      />
      <StatCard
        tone="tile"
        label="Equipo"
        value={kpis.teamSize}
        icon={<MdOutlineGroups aria-hidden />}
        description={
          kpis.teamSize > 0 ? (
            <>
              <Badge variant="secondary" className="tabular-nums">
                {kpis.teamRoleCount === 1 ? '1 rol' : `${kpis.teamRoleCount} roles`}
              </Badge>
            </>
          ) : (
            'Sin profesionales'
          )
        }
      />
    </Card>
  );
}
