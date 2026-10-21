'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/ui/components/Chart';
import { numberLabel } from '../../lib/dashboard-view';

const PATTERN_ID = 'labor-pending-stripes';

interface LaborChartProps {
  data: { labor: string; short: string; done: number; pending: number }[];
  config: ChartConfig;
}

/** Barras apiladas de `LaborChartCard`, en su propio archivo para que recharts se cargue aparte. */
export default function LaborChart({ data, config: chartConfig }: LaborChartProps) {
  return (
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
        <XAxis dataKey="short" tickLine={false} tickMargin={8} axisLine={false} interval={0} />
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
        <Bar dataKey="pending" stackId="labor" fill={`url(#${PATTERN_ID})`} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
