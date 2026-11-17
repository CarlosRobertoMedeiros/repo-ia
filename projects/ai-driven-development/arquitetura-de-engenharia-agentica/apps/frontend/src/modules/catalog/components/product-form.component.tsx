'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FormSectionLayout } from '@/shared/components/ui/form-section-layout';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { getMessage } from '@/shared/i18n';
import {
  PRODUCT_STATUSES,
  type ProductStatus,
  type ProductSummary,
  type SaveProductPayload,
} from '../util/product-api.util';

type AvailabilityField = 'availableOnline' | 'featured' | 'allowsPreOrder';

const AVAILABILITY_FIELDS: Array<{ field: AvailabilityField; label: string; hint: string }> = [
  { field: 'availableOnline', label: 'Disponível online', hint: 'Pode ser vendido pela loja virtual.' },
  { field: 'featured', label: 'Destaque', hint: 'Aparece em posições de destaque.' },
  { field: 'allowsPreOrder', label: 'Permite pré-venda', hint: 'Aceita pedidos antes de ter estoque.' },
];

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

type ProductFormProps = {
  initialValues?: ProductSummary;
  submitting?: boolean;
  onSubmit: (payload: SaveProductPayload) => void;
  cancelHref: string;
};

/** Formulario compartilhado entre criacao e edicao de produto. */
export function ProductForm({ initialValues, submitting = false, onSubmit, cancelHref }: ProductFormProps) {
  const [availability, setAvailability] = useState<Record<AvailabilityField, boolean>>({
    availableOnline: initialValues?.availableOnline ?? false,
    featured: initialValues?.featured ?? false,
    allowsPreOrder: initialValues?.allowsPreOrder ?? false,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    // Regras de negocio (tamanhos, preco, status) sao validadas no backend.
    onSubmit({
      name: String(data.get('name') ?? ''),
      description: String(data.get('description') ?? ''),
      price: Number(data.get('price')),
      status: String(data.get('status') ?? '') as ProductStatus,
      ...availability,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <FormSectionLayout title="Dados básicos" description="Como o produto é identificado e apresentado.">
        <div>
          <Label htmlFor="product-name">Nome</Label>
          <Input
            id="product-name"
            name="name"
            autoComplete="off"
            placeholder="Café especial"
            defaultValue={initialValues?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="product-description">Descrição</Label>
          <Textarea
            id="product-description"
            name="description"
            rows={4}
            placeholder="Opcional"
            defaultValue={initialValues?.description ?? ''}
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout title="Preço e status" description="Valor de venda e situação do produto no catálogo.">
        <div>
          <Label htmlFor="product-price">Preço (R$)</Label>
          <Input
            id="product-price"
            name="price"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={initialValues?.price}
            required
          />
        </div>
        <div>
          <Label htmlFor="product-status">Status</Label>
          <select
            id="product-status"
            name="status"
            className={SELECT_CLASS}
            defaultValue={initialValues?.status ?? 'draft'}
            required
          >
            {PRODUCT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getMessage(`product.status.${status}`)}
              </option>
            ))}
          </select>
        </div>
      </FormSectionLayout>

      <FormSectionLayout title="Disponibilidade" description="Opções independentes de exposição e venda." showDivider={false}>
        {AVAILABILITY_FIELDS.map(({ field, label, hint }) => (
          <div key={field} className="flex items-start gap-3">
            <Checkbox
              id={`product-${field}`}
              checked={availability[field]}
              onCheckedChange={(checked) =>
                setAvailability((current) => ({ ...current, [field]: checked === true }))
              }
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor={`product-${field}`}>{label}</Label>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          </div>
        ))}
      </FormSectionLayout>

      <div className="flex justify-end gap-3">
        <Button asChild type="button" variant="secondary">
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
