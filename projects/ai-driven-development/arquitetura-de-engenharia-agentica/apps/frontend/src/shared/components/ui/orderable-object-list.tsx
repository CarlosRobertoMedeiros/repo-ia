'use client';

import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/class-name.util';

type OrderableObjectListLabels = {
  moveUp?: string;
  moveDown?: string;
  remove?: string;
};

export type OrderableObjectListRenderParams<TItem> = {
  item: TItem;
  index: number;
  total: number;
};

type OrderableObjectListProps<TItem> = {
  items: TItem[];
  onChange: (items: TItem[]) => void;
  renderItem: (params: OrderableObjectListRenderParams<TItem>) => ReactNode;
  getItemKey?: (item: TItem, index: number) => string;
  getItemTitle?: (params: OrderableObjectListRenderParams<TItem>) => ReactNode;
  setItemOrder?: (item: TItem, order: number) => TItem;
  orderStartsAt?: number;
  emptyState?: ReactNode;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
  labels?: OrderableObjectListLabels;
};

function normalizeItemsOrder<TItem>(
  items: TItem[],
  setItemOrder: ((item: TItem, order: number) => TItem) | undefined,
  orderStartsAt: number,
) {
  if (!setItemOrder) {
    return items;
  }

  return items.map((item, index) => setItemOrder(item, index + orderStartsAt));
}

function moveArrayItem<TItem>(items: TItem[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  if (movedItem === undefined) {
    return items;
  }

  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export function OrderableObjectList<TItem>({
  items,
  onChange,
  renderItem,
  getItemKey,
  getItemTitle,
  setItemOrder,
  orderStartsAt = 1,
  emptyState,
  disabled = false,
  className,
  itemClassName,
  labels,
}: OrderableObjectListProps<TItem>) {
  function handleMoveUp(index: number) {
    if (disabled || index <= 0) {
      return;
    }

    const nextItems = moveArrayItem(items, index, index - 1);
    onChange(normalizeItemsOrder(nextItems, setItemOrder, orderStartsAt));
  }

  function handleMoveDown(index: number) {
    if (disabled || index >= items.length - 1) {
      return;
    }

    const nextItems = moveArrayItem(items, index, index + 1);
    onChange(normalizeItemsOrder(nextItems, setItemOrder, orderStartsAt));
  }

  function handleRemove(index: number) {
    if (disabled) {
      return;
    }

    const nextItems = items.filter((_, currentIndex) => currentIndex !== index);
    onChange(normalizeItemsOrder(nextItems, setItemOrder, orderStartsAt));
  }

  if (items.length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground', className)}>
        {emptyState ?? 'Nenhum item adicionado.'}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => {
        const params: OrderableObjectListRenderParams<TItem> = {
          item,
          index,
          total: items.length,
        };

        const itemKey = getItemKey?.(item, index) ?? String(index);
        const itemTitle = getItemTitle?.(params) ?? `Item ${index + 1}`;

        return (
          <div key={itemKey} className={cn('rounded-lg border border-border p-4', itemClassName)}>
            <div className="mb-4 flex items-start justify-between gap-2">
              <div className="min-h-9 flex items-center text-sm font-medium">{itemTitle}</div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={labels?.moveUp ?? 'Mover item para cima'}
                  title={labels?.moveUp ?? 'Mover para cima'}
                  disabled={disabled || index === 0}
                  onClick={() => handleMoveUp(index)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={labels?.moveDown ?? 'Mover item para baixo'}
                  title={labels?.moveDown ?? 'Mover para baixo'}
                  disabled={disabled || index === items.length - 1}
                  onClick={() => handleMoveDown(index)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={labels?.remove ?? 'Excluir item'}
                  title={labels?.remove ?? 'Excluir'}
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            {renderItem(params)}
          </div>
        );
      })}
    </div>
  );
}
