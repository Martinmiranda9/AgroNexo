'use client';

import dynamic from 'next/dynamic';
import type { LaborProgress } from '@/core/models/farm-dashboard.model';
import { Card } from '@/ui/components/Card';
import type { ChartConfig } from '@/ui/components/Chart';
import { Skeleton } from '@/ui/components/Skeleton';
import { ACTIVITY_TYPE_LABEL } from '../../lib/dashboard-view';

// Recharts pesa ~130 kB: se baja aparte, después de pintar el tablero, con el lugar del gráfico ya reservado.
const LaborChart = dynamic(() => import('./LaborChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-52 w-full" />,
});

/*
 * Cashmere "Bar Chart - Stacked + Legend" (registro `cashmere/chart-bar-stacked-base`), como el "Profit and Loss" de
 * la referencia: por labor, las hectáreas hechas abajo en pine y las pendientes arriba rayadas en verde campo.
 */

const chartConfig = {
  done: { label: 'Hecho', color: 'var(--color-pine)' },
  pending: { label: 'Pendiente', color: 'var(--color-field-500)' },
} satisfies ChartConfig;

/** Rótulos cortos para que entren todas las labores debajo de las barras; el tooltip muestra el nombre completo. */
const SHORT_LABEL: Partial<Record<LaborProgress['type'], string>> = {
  Spraying: 'Pulveriz.',
  Fertilization: 'Fertiliz.',
};

export default function LaborChartCard({ laborProgress }: { laborProgress: LaborProgress[] }) {
  const data = laborProgress
    .filter((labor) => labor.hectaresPlanned > 0 || labor.hectaresWorked > 0)
    .map((labor) => ({
      labor: ACTIVITY_TYPE_LABEL[labor.type],
      short: SHORT_LABEL[labor.type] ?? ACTIVITY_TYPE_LABEL[labor.type],
      done: labor.hectaresWorked,
      pending: Math.max(0, labor.hectaresPlanned - labor.hectaresWorked),
    }));

  return (
    <Card className="flex h-full min-w-0 flex-col gap-4 p-4">
      <div className="px-1 pt-1">
        <h2 className="text-heading-sm text-foreground font-medium">Avance de labores</h2>
        <p className="text-body-sm text-muted-foreground mt-0.5">
          Hectáreas hechas y pendientes de cada labor en la campaña.
        </p>
      </div>

      <div className="bg-surface-sunken flex flex-1 flex-col rounded-xl p-3">
        <div className="flex items-center justify-between gap-2 px-1 pb-2">
          <p className="text-body-sm text-foreground font-medium">Hecho y pendiente</p>
          <ul className="text-caption text-muted-foreground flex items-center gap-3">
            {Object.entries(chartConfig).map(([key, item]) => (
              <li key={key} className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-xs"
                  style={{ background: item.color }}
                  aria-hidden
                />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {data.length === 0 ? (
          <p className="text-body-sm text-muted-foreground flex flex-1 items-center justify-center px-4 py-10 text-center">
            Cargá cultivos en los lotes para ver cuánto falta de cada labor.
          </p>
        ) : (
          <LaborChart data={data} config={chartConfig} />
        )}
      </div>
    </Card>
  );
}
