'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useApiErrorHandler, useAuth } from '@/modules/auth';
import { Button } from '@/shared/components/ui/button';
import { DeleteConfirmationDialog } from '@/shared/components/ui/delete-confirmation-dialog';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { PaginationControls } from '@/shared/components/ui/pagination-controls';
import { TableCard } from '@/shared/components/ui/table-card';
import { getMessage } from '@/shared/i18n';
import { ProductTable } from '../components/product-table.component';
import {
  deleteProduct,
  listProducts,
  type ProductPage,
  type ProductSummary,
} from '../util/product-api.util';

const PER_PAGE = 10;

export default function ProductListPage() {
  const { token } = useAuth();
  const handleApiError = useApiErrorHandler();

  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<{ key: string; data: ProductPage | null } | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestKey = `${page}:${reloadToken}`;
  const loading = result?.key !== requestKey;
  const data = result?.data ?? null;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const loaded = await listProducts(token, page, PER_PAGE);
        if (!cancelled) setResult({ key: requestKey, data: loaded });
      } catch (error) {
        if (cancelled) return;
        setResult({ key: requestKey, data: null });
        handleApiError(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, page, requestKey, handleApiError]);

  async function handleConfirmDelete() {
    if (!token || !productToDelete) return;

    setDeleting(true);

    try {
      await deleteProduct(token, productToDelete.id);
      toast.success(getMessage('PRODUCT_DELETED'));
      setProductToDelete(null);

      if (data && data.items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setReloadToken((value) => value + 1);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Catálogo"
        title="Produtos"
        subtitle="Gerencie os produtos do catálogo."
        aside={
          <Button asChild>
            <Link href="/catalog/products/new">
              <Plus className="size-4" />
              Novo produto
            </Link>
          </Button>
        }
      />

      <TableCard
        footer={
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={data?.total}
            totalLabel="produtos"
            onPageChange={setPage}
            disabled={loading}
          />
        }
      >
        <ProductTable products={data?.items ?? []} loading={loading} onDelete={setProductToDelete} />
      </TableCard>

      <DeleteConfirmationDialog
        open={productToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir produto"
        description="Esta ação remove o produto de forma permanente."
        itemLabel="Produto"
        itemValue={productToDelete?.name}
        isConfirming={deleting}
      />
    </div>
  );
}
