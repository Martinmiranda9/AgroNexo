import type { ReactNode } from 'react';
import type { CampaignTimeline } from '@/core/models/farm-dashboard.model';
import { Card } from '@/ui/components/Card';
import { Progress } from '@/ui/components/Progress';
import { cropLabel, formatFullDate, percentLabel } from '../../lib/dashboard-view';

interface CampaignProgressCardProps {
  timeline: CampaignTimeline | null;
  /** Para el productor: crear la primera campaña. */
  emptyAction?: ReactNode;
}

/**
 * Avance de la campaña (el "Monthly Spending Limit" de la referencia): la barra de lo transcurrido, con el porcentaje a
 * la izquierda y las fechas a la derecha. Debajo, la próxima cosecha si hay una cargada.
 */
export default function CampaignProgressCard({ timeline, emptyAction }: CampaignProgressCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="text-body text-foreground font-medium">
        {timeline ? `Campaña ${timeline.name}` : 'Campaña'}
      </h2>

      {timeline ? (
        <>
          <Progress
            value={Math.round(timeline.progress * 100)}
            size="thick"
            aria-label={`Campaña ${timeline.name}: ${percentLabel(timeline.progress)} transcurrido`}
          />
          <div className="text-caption text-muted-foreground -mt-1 flex items-baseline justify-between gap-3">
            <span>
              <span className="text-foreground text-body-sm font-semibold tabular-nums">
                {percentLabel(timeline.progress)}
              </span>{' '}
              transcurrido
            </span>
            <span className="tabular-nums">
              {formatFullDate(timeline.startsOn)} – {formatFullDate(timeline.endsOn)}
            </span>
          </div>
          {timeline.nextHarvest && (
            <p className="text-caption text-muted-foreground">
              Próxima cosecha:{' '}
              <span className="text-foreground font-medium">
                {timeline.nextHarvest.lotName} ({cropLabel(timeline.nextHarvest.crop)})
              </span>{' '}
              en <span className="tabular-nums">{timeline.nextHarvest.daysLeft}</span> días
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-body-sm text-muted-foreground">
            Todavía no hay una campaña para seguir el avance.
          </p>
          {emptyAction}
        </div>
      )}
    </Card>
  );
}
