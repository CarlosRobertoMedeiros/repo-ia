'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { getMessage } from '@/shared/i18n';
import { cn } from '@/shared/lib/class-name.util';
import type { ProductStatus, ProductSummary } from '../util/product-api.util';

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_CLASSES: Record<ProductStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  inactive: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400',
  draft: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

type ProductTableProps = {
  products: ProductSummary[];
  loading?: boolean;
  onDelete: (product: ProductSummary) => void;
};

export function ProductTable({ products, loading = false, onDelete }: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="text-right">Preço</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-28 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
              {loading ? 'Carregando...' : 'Nenhum produto cadastrado.'}
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-right tabular-nums">{priceFormatter.format(product.price)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(STATUS_CLASSES[product.status])}>
                  {getMessage(`product.status.${product.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label={`Editar ${product.name}`}>
                    <Link href={`/catalog/products/${product.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${product.name}`}
                    className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
