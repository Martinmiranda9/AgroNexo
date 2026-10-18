'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { LaborProgress } from '@/core/models/farm-dashboard.model';
import { Card } from '@/ui/components/Card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/ui/components/Chart';
import { ACTIVITY_TYPE_LABEL, numberLabel } from '../../lib/dashboard-view';

/*
 * Cashmere "Bar Chart - Stacked + Legend" (registro `cashmere/chart-bar-stacked-base`), como el "Profit and Loss" de
 * la referencia: por labor, las hectáreas hechas abajo en pine y las pendientes arriba rayadas en verde campo.
 */

const chartConfig = {
  done: { label: 'Hecho', color: 'var(--color-pine)' },
  pending: { label: 'Pendiente', color: 'var(--color-field-500)' },
} satisfies ChartConfig;

const PATTERN_ID = 'labor-pending-stripes';

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
          <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
            <BarChart accessibilityLayer data={data} margin={{ left: -8, right: 4, top: 8 }}>
              <defs>
                <pattern
                  id={PATTERN_ID}
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="6" height="6" fill="var(--color-field-200)" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-pending)" strokeWidth="3" />
                </pattern>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="short"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(value: number) => numberLabel(value)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.labor}
                    formatter={(value, name) => (
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                        </span>
                        <span className="text-foreground font-medium tabular-nums">
                          {numberLabel(Number(value))} ha
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <Bar dataKey="done" stackId="labor" fill="var(--color-done)" radius={[0, 0, 6, 6]} />
              <Bar
                dataKey="pending"
                stackId="labor"
                fill={`url(#${PATTERN_ID})`}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
}
