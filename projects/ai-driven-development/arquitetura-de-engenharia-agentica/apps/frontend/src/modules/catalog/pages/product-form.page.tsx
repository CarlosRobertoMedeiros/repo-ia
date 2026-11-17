'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApiErrorHandler, useAuth } from '@/modules/auth';
import { FormSkeleton } from '@/shared/components/ui/form-skeleton';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { getMessage } from '@/shared/i18n';
import { ProductForm } from '../components/product-form.component';
import {
  createProduct,
  getProduct,
  updateProduct,
  type ProductSummary,
  type SaveProductPayload,
} from '../util/product-api.util';

const LIST_ROUTE = '/catalog/products';

type ProductFormPageProps = {
  /** Sem `productId` o formulario cria; com `productId` carrega e edita. */
  productId?: string;
};

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  const router = useRouter();
  const { token } = useAuth();
  const handleApiError = useApiErrorHandler();

  const isEditing = productId !== undefined;
  const [loaded, setLoaded] = useState<{ id: string; product: ProductSummary } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loading = isEditing && loaded?.id !== productId;

  useEffect(() => {
    if (!token || productId === undefined) return;

    let cancelled = false;

    (async () => {
      try {
        const product = await getProduct(token, productId);
        if (!cancelled) setLoaded({ id: productId, product });
      } catch (error) {
        if (cancelled) return;
        handleApiError(error);
        router.replace(LIST_ROUTE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, productId, handleApiError, router]);

  async function handleSubmit(payload: SaveProductPayload) {
    if (!token) return;

    setSubmitting(true);

    try {
      if (productId === undefined) {
        await createProduct(token, payload);
      } else {
        await updateProduct(token, productId, payload);
      }

      toast.success(getMessage('PRODUCT_SAVED'));
      router.push(LIST_ROUTE);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageSectionHeader
        badge="Catálogo"
        title={isEditing ? 'Editar produto' : 'Novo produto'}
        subtitle={isEditing ? 'Altere os dados do produto.' : 'Cadastre um novo produto no catálogo.'}
      />

      {loading ? (
        <FormSkeleton sections={3} rowsPerSection={2} />
      ) : (
        <ProductForm
          key={productId ?? 'new'}
          initialValues={loaded?.product}
          submitting={submitting}
          onSubmit={handleSubmit}
          cancelHref={LIST_ROUTE}
        />
      )}
    </div>
  );
}
