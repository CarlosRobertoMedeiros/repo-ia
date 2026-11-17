'use client';

import { RefreshCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Combobox } from '@/shared/components/ui/combobox';
import { cn } from '@/shared/lib/class-name.util';

type DashboardRankingListCardProps = {
  title: string;
  subtitle: string;
  items: Array<{
    id?: string;
    description: string;
    amountLabel: string;
    dateLabel: string;
  }>;
  error: string | null;
  isLoading: boolean;
  selectedMonths: number;
  selectedLimitValue: string;
  setSelectedLimitValue: (value: string) => void;
  onRefresh: () => Promise<void>;
  accentClassName: string;
  amountClassName: string;
  limitOptions: ReadonlyArray<{
    value: string;
    label: string;
  }>;
  emptyLabel: string;
  dateLabelPrefix?: string;
};

export function DashboardRankingListCard({
  title,
  subtitle,
  items,
  error,
  isLoading,
  selectedMonths,
  selectedLimitValue,
  setSelectedLimitValue,
  onRefresh,
  accentClassName,
  amountClassName,
  limitOptions,
  emptyLabel,
  dateLabelPrefix,
}: DashboardRankingListCardProps) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-linear-to-br from-zinc-900 via-zinc-900/95 to-zinc-800/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
      <div className={cn('pointer-events-none absolute inset-0 opacity-90', accentClassName)} />

      <CardHeader className="relative gap-4 border-b border-white/8 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-zinc-50">{title}</CardTitle>
            <p className="max-w-xl text-sm text-zinc-400">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="min-w-[140px]">
              <Combobox
                options={[...limitOptions]}
                value={selectedLimitValue}
                onChange={setSelectedLimitValue}
                placeholder="Qtd. itens"
              />
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
        </div>
      </CardHeader>

      <CardContent className="relative pt-6">
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {!error ? (
          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                Carregando {title.toLowerCase()}...
              </div>
            ) : null}

            {!isLoading && items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                Nenhum {emptyLabel} encontrado para os ultimos {selectedMonths} meses.
              </div>
            ) : null}

            {!isLoading && items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id ?? `${item.description}-${item.dateLabel}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {index + 1}. {item.description}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {dateLabelPrefix ? `${dateLabelPrefix}: ` : null}
                        {item.dateLabel}
                      </p>
                    </div>

                    <p className={cn('shrink-0 text-sm font-semibold', amountClassName)}>
                      {item.amountLabel}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
