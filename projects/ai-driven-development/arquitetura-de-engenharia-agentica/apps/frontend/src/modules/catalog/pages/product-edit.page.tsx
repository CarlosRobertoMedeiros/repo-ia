'use client';

import { useParams } from 'next/navigation';
import ProductFormPage from './product-form.page';

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();

  return <ProductFormPage productId={id} />;
}
