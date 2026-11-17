'use client';

import type { ReactNode } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/shared/lib/class-name.util';

type ChartValue = string | number | null | undefined;
type ChartDatum = object;

type ComposedBarLineChartProps<TData extends ChartDatum> = {
  data: TData[];
  xKey: keyof TData & string;
  barKey: keyof TData & string;
  lineKey: keyof TData & string;
  barLabel?: string;
  lineLabel?: string;
  barColor?: string;
  lineColor?: string;
  height?: number;
  className?: string;
  emptyState?: ReactNode;
  xAxisTickFormatter?: (value: ChartValue) => string;
  tooltipLabelFormatter?: (value: ChartValue) => string;
  valueFormatter?: (value: number, dataKey: string) => string;
};

const DEFAULT_EMPTY_STATE = (
  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] text-sm text-zinc-500">
    Nenhum dado disponível para exibir no gráfico.
  </div>
);

export function ComposedBarLineChart<TData extends ChartDatum>({
  data,
  xKey,
  barKey,
  lineKey,
  barLabel = 'Barras',
  lineLabel = 'Linha',
  barColor = '#f97316',
  lineColor = '#22c55e',
  height = 320,
  className,
  emptyState = DEFAULT_EMPTY_STATE,
  xAxisTickFormatter,
  tooltipLabelFormatter,
  valueFormatter,
}: ComposedBarLineChartProps<TData>) {
  const formatValue = (value: number, dataKey: string) => {
    if (valueFormatter) {
      return valueFormatter(value, dataKey);
    }

    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (data.length === 0) {
    return (
      <div className={className} style={{ height }}>
        {emptyState}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <XAxis
            axisLine={false}
            dataKey={xKey as string}
            minTickGap={24}
            tickLine={false}
            tickMargin={10}
            tick={{ fill: 'rgba(244,244,245,0.72)', fontSize: 12 }}
            tickFormatter={
              xAxisTickFormatter
                ? (value) => xAxisTickFormatter(value as ChartValue)
                : undefined
            }
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            tick={{ fill: 'rgba(244,244,245,0.6)', fontSize: 12 }}
            tickFormatter={(value: number) => formatValue(value, '')}
            width={80}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              backgroundColor: 'rgba(24,24,27,0.96)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            formatter={(value, name) => {
              const numericValue =
                typeof value === 'number'
                  ? value
                  : typeof value === 'string'
                    ? Number(value)
                    : 0;

              return [
                formatValue(Number.isFinite(numericValue) ? numericValue : 0, String(name)),
                String(name),
              ];
            }}
            labelFormatter={(value) =>
              tooltipLabelFormatter
                ? tooltipLabelFormatter(value as ChartValue)
                : String(value)
            }
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend
            verticalAlign="top"
            height={32}
            wrapperStyle={{ fontSize: '12px', color: 'rgba(244,244,245,0.72)' }}
          />
          <Bar
            dataKey={barKey as string}
            fill={barColor}
            name={barLabel}
            radius={[10, 10, 4, 4]}
            maxBarSize={40}
          />
          <Line
            dataKey={lineKey as string}
            dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: lineColor, strokeWidth: 0 }}
            name={lineLabel}
            stroke={lineColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
