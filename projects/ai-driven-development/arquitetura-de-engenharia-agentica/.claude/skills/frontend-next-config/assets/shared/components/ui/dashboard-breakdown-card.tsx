'use client';

import { RefreshCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PieBreakdownChart } from '@/shared/components/ui/pie-breakdown-chart';
import { cn } from '@/shared/lib/class-name.util';

type DashboardBreakdownCardProps = {
  title: string;
  subtitle: string;
  items: Array<{
    label: string;
    totalAmount: number;
    amountLabel: string;
    color: string;
  }>;
  error: string | null;
  isLoading: boolean;
  selectedMonths: number;
  onRefresh: () => Promise<void>;
  accentClassName: string;
};

export function DashboardBreakdownCard({
  title,
  subtitle,
  items,
  error,
  isLoading,
  selectedMonths,
  onRefresh,
  accentClassName,
}: DashboardBreakdownCardProps) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-linear-to-br from-zinc-900 via-zinc-900/95 to-zinc-800/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
      <div className={cn('pointer-events-none absolute inset-0 opacity-90', accentClassName)} />

      <CardHeader className="relative gap-4 border-b border-white/8 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-zinc-50">{title}</CardTitle>
            <p className="max-w-xl text-sm text-zinc-400">{subtitle}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void onRefresh()}
            disabled={isLoading}
            aria-label={`Atualizar ${title.toLowerCase()}`}
            title={`Atualizar ${title.toLowerCase()}`}
            className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
          >
            <RefreshCcw className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5 pt-6">
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {!error ? (
          <>
            <PieBreakdownChart
              data={items.map((item) => ({
                label: item.label,
                value: item.totalAmount,
                color: item.color,
              }))}
              height={340}
              showLegend={false}
              valueFormatter={(value) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(value)
              }
              emptyState={
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 text-sm text-zinc-500">
                  {isLoading
                    ? `Carregando ${title.toLowerCase()}...`
                    : `Nenhum dado disponivel para os ultimos ${selectedMonths} meses.`}
                </div>
              }
            />

            {!isLoading && items.length > 0 ? (
              <div className="space-y-2">
                {items.slice(0, 6).map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <p className="truncate text-sm font-medium text-zinc-100">{item.label}</p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-zinc-200">{item.amountLabel}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
